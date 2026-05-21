"use client";

import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useReadContracts,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { decodeEventLog, type Address } from "viem";
import { useEffect, useMemo, useState } from "react";
import {
  BUILDER_CODE,
  CONTRACT_ADDRESS,
  DATA_SUFFIX,
  FISHING_ITEMS,
  fishingAbi,
} from "@/lib/contract";

type Tab = "fish" | "collection" | "league" | "invite";

const tabs: { id: Tab; label: string }[] = [
  { id: "fish", label: "Fish" },
  { id: "collection", label: "Collection" },
  { id: "league", label: "League" },
  { id: "invite", label: "Invite" },
];

const rarityLabels = ["", "Common", "Rare", "Legendary", "Mythic", "Strange"];

function shortAddress(address?: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function isBaseAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /base/i.test(navigator.userAgent);
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("fish");
  const [lastCatch, setLastCatch] = useState<{
    itemName: string;
    rarity: bigint;
  } | null>(null);
  const [mode, setMode] = useState<"dailyFishing" | "deepSeaFishing">(
    "dailyFishing",
  );
  const [referrer, setReferrer] = useState("");

  const { address, chainId, isConnected } = useAccount();
  const { connectors, connect, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const {
    data: hash,
    writeContract,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    data: receipt,
  } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("basefishing_ref", ref);
      setTimeout(() => setReferrer(ref), 0);
    } else {
      setTimeout(
        () => setReferrer(localStorage.getItem("basefishing_ref") || ""),
        0,
      );
    }
  }, []);

  useEffect(() => {
    if (!isBaseAppBrowser() || isConnected) return;
    if (localStorage.getItem("basefishing_manual_disconnect") === "true") {
      return;
    }
    const injectedConnector = connectors.find(
      (connector) => connector.type === "injected",
    );
    if (injectedConnector) connect({ connector: injectedConnector });
  }, [connect, connectors, isConnected]);

  useEffect(() => {
    if (!receipt) return;

    for (const log of receipt.logs) {
      try {
        const event = decodeEventLog({
          abi: fishingAbi,
          data: log.data,
          topics: log.topics,
        });

        if (event.eventName === "FishCaught") {
          setTimeout(
            () =>
              setLastCatch({
                itemName: event.args.itemName,
                rarity: event.args.rarity,
              }),
            0,
          );
        }
      } catch {
        // The receipt can include logs from other contracts.
      }
    }
  }, [receipt]);

  const playerRead = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: fishingAbi,
    functionName: "getPlayer",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: isConfirmed ? 4_000 : false },
  });

  const historyLengthRead = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: fishingAbi,
    functionName: "getHistoryLength",
    args: address ? [address] : undefined,
    query: { enabled: Boolean(address), refetchInterval: isConfirmed ? 4_000 : false },
  });

  const historyIndexes = useMemo(() => {
    const length = Number(historyLengthRead.data || 0n);
    return Array.from({ length: Math.min(length, 5) }, (_, i) =>
      BigInt(length - i - 1),
    );
  }, [historyLengthRead.data]);

  const historyRead = useReadContracts({
    contracts: historyIndexes.map((index) => ({
      address: CONTRACT_ADDRESS,
      abi: fishingAbi,
      functionName: "getHistoryRecord",
      args: [address as Address, index],
    })),
    query: { enabled: Boolean(address && historyIndexes.length) },
  });

  const discoveriesRead = useReadContracts({
    contracts: FISHING_ITEMS.map((item) => ({
      address: CONTRACT_ADDRESS,
      abi: fishingAbi,
      functionName: "hasDiscovered",
      args: [address as Address, item],
    })),
    query: { enabled: Boolean(address) },
  });

  const platformRead = useReadContracts({
    contracts: [
      { address: CONTRACT_ADDRESS, abi: fishingAbi, functionName: "totalPlatformCatches" },
      { address: CONTRACT_ADDRESS, abi: fishingAbi, functionName: "totalLegendaryCaught" },
      { address: CONTRACT_ADDRESS, abi: fishingAbi, functionName: "totalStrangeItemsFound" },
      { address: CONTRACT_ADDRESS, abi: fishingAbi, functionName: "getTopFisher" },
      { address: CONTRACT_ADDRESS, abi: fishingAbi, functionName: "getTopLegendHunter" },
    ],
  });

  const player = playerRead.data;
  const stats = {
    catches: player?.[0] || 0n,
    common: player?.[1] || 0n,
    rare: player?.[2] || 0n,
    legendary: player?.[3] || 0n,
    strange: player?.[4] || 0n,
    combo: player?.[5] || 0n,
    bestCombo: player?.[6] || 0n,
    xp: player?.[7] || 0n,
    title: player?.[8] || "Fishing Rookie",
  };

  const inviteLink =
    typeof window === "undefined" || !address
      ? ""
      : `${window.location.origin}?ref=${address}`;

  const castLine = () => {
    if (!isConnected) return;
    if (chainId !== base.id) {
      switchChain({ chainId: base.id });
      return;
    }
    setLastCatch(null);
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: fishingAbi,
      functionName: mode,
      dataSuffix: DATA_SUFFIX,
    });
  };

  const primaryLabel = !isConnected
    ? "Connect Wallet"
    : chainId !== base.id
      ? "Switch to Base"
      : mode === "dailyFishing"
        ? "Cast Daily Line"
        : "Cast Deep Sea Line";

  return (
    <main className="app-shell">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Base Mini App</p>
          <h1>BaseFishing</h1>
          <p className="subtitle">
            Fish once a day, chase rare sea finds, and keep your encyclopedia onchain.
          </p>
        </div>
        <div className="ocean-scene" aria-hidden="true">
          <div className="sun" />
          <div className="fish fish-one">
            {">"}
            <span />
          </div>
          <div className="fish fish-two">
            {">"}
            <span />
          </div>
          <div className="hook" />
          <div className="wave wave-one" />
          <div className="wave wave-two" />
        </div>
      </section>

      <nav className="tabbar" aria-label="BaseFishing pages">
        {tabs.map((item) => (
          <button
            key={item.id}
            className={tab === item.id ? "active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {tab === "fish" && (
        <section className="panel">
          <div className="wallet-row">
            <div>
              <p className="muted">Wallet</p>
              <strong>{isConnected ? shortAddress(address) : "Not connected"}</strong>
            </div>
            {isConnected && (
              <button
                className="ghost-button"
                onClick={() => {
                  localStorage.setItem("basefishing_manual_disconnect", "true");
                  disconnect();
                }}
              >
                Disconnect
              </button>
            )}
          </div>

          {!isConnected ? (
            <div className="wallet-grid">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  className="wallet-button"
                  disabled={isConnecting}
                  onClick={() => {
                    localStorage.removeItem("basefishing_manual_disconnect");
                    connect({ connector });
                  }}
                >
                  {connector.name}
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="mode-switch" role="tablist" aria-label="Fishing mode">
                <button
                  className={mode === "dailyFishing" ? "active" : ""}
                  onClick={() => setMode("dailyFishing")}
                >
                  Daily
                </button>
                <button
                  className={mode === "deepSeaFishing" ? "active" : ""}
                  onClick={() => setMode("deepSeaFishing")}
                >
                  Deep Sea
                </button>
              </div>

              <button
                className="cast-button"
                disabled={isWriting || isConfirming || isSwitching}
                onClick={castLine}
              >
                {isWriting || isConfirming || isSwitching ? "Casting..." : primaryLabel}
              </button>
            </>
          )}

          <div className="reward-card">
            <p className="muted">Latest reward</p>
            <h2>{lastCatch?.itemName || "Your first catch appears here"}</h2>
            <span className="rarity">
              {lastCatch ? rarityLabels[Number(lastCatch.rarity)] || "Rare Find" : "Ready"}
            </span>
          </div>

          {writeError && <p className="error-text">{writeError.message}</p>}

          <div className="stats-grid">
            <Stat label="Total Catches" value={stats.catches} />
            <Stat label="Fishing XP" value={stats.xp} />
            <Stat label="Combo" value={stats.combo} />
            <Stat label="Best Combo" value={stats.bestCombo} />
          </div>
        </section>
      )}

      {tab === "collection" && (
        <section className="panel">
          <div className="section-title">
            <div>
              <p className="muted">Onchain encyclopedia</p>
              <h2>{stats.title}</h2>
            </div>
            <span className="pill">{stats.catches.toString()} catches</span>
          </div>

          <div className="collection-grid">
            {FISHING_ITEMS.map((item, index) => {
              const found = Boolean(discoveriesRead.data?.[index]?.result);
              return (
                <article key={item} className={found ? "fish-card found" : "fish-card"}>
                  <span className="fish-icon">{found ? "><>" : "??"}</span>
                  <strong>{found ? item : "Undiscovered"}</strong>
                  <p>{found ? "Recorded forever" : "Cast a line to reveal"}</p>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {tab === "league" && (
        <section className="panel">
          <div className="section-title">
            <div>
              <p className="muted">Ocean league</p>
              <h2>Live Base waters</h2>
            </div>
          </div>
          <div className="stats-grid">
            <Stat label="Platform Catches" value={platformRead.data?.[0]?.result || 0n} />
            <Stat label="Legendary Caught" value={platformRead.data?.[1]?.result || 0n} />
            <Stat label="Strange Finds" value={platformRead.data?.[2]?.result || 0n} />
            <Stat label="Your Strange Finds" value={stats.strange} />
          </div>
          <div className="leader-card">
            <p>Top Fisher</p>
            <strong>{formatLeader(platformRead.data?.[3]?.result)}</strong>
          </div>
          <div className="leader-card">
            <p>Top Legend Hunter</p>
            <strong>{formatLeader(platformRead.data?.[4]?.result)}</strong>
          </div>
          <div className="history-list">
            <h3>Recent catches</h3>
            {historyRead.data?.length ? (
              historyRead.data.map((entry, index) => {
                const result = entry.result as
                  | readonly [bigint, string, bigint, boolean]
                  | undefined;
                if (!result) return null;
                return (
                  <div className="history-row" key={`${result[0]}-${index}`}>
                    <div>
                      <strong>{result[1]}</strong>
                      <p>{result[3] ? "Daily Fishing" : "Deep Sea Fishing"}</p>
                    </div>
                    <span>{rarityLabels[Number(result[2])] || "Find"}</span>
                  </div>
                );
              })
            ) : (
              <p className="muted">Connect and cast to build your feed.</p>
            )}
          </div>
        </section>
      )}

      {tab === "invite" && (
        <section className="panel">
          <div className="section-title">
            <div>
              <p className="muted">Referral tide</p>
              <h2>Bring friends to the dock</h2>
            </div>
          </div>
          <p className="body-copy">
            Share your link so new anglers land in your school. No token purchase is needed:
            they only need a Base wallet and gas for onchain catches.
          </p>
          <div className="invite-box">{inviteLink || "Connect to create your invite link"}</div>
          <button
            className="cast-button secondary-cast"
            disabled={!inviteLink}
            onClick={() => navigator.clipboard.writeText(inviteLink)}
          >
            Copy Invite Link
          </button>
          {referrer && (
            <p className="muted">You joined from {shortAddress(referrer as Address)}.</p>
          )}
          <div className="builder-code">
            <span>Builder Code</span>
            <strong>{BUILDER_CODE}</strong>
          </div>
        </section>
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: bigint | number }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value.toString()}</strong>
    </div>
  );
}

function formatLeader(result: unknown) {
  if (!Array.isArray(result)) return "No catches yet";
  const [address, count] = result as [Address, bigint];
  if (!address || address === "0x0000000000000000000000000000000000000000") {
    return "No catches yet";
  }
  return `${shortAddress(address)} - ${count.toString()}`;
}
