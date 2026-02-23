export interface RankResult {
  level: string;
  title: string;
  nextAt: number | null;
}

interface RankDefinition {
  threshold: number;
  level: string;
  title: string;
}

const RANKS: RankDefinition[] = [
  { threshold: 0, level: "Initiate", title: "初入者" },
  { threshold: 1_000, level: "Acolyte", title: "侍祭者" },
  { threshold: 10_000, level: "Priest", title: "祭司" },
  { threshold: 100_000, level: "Bishop", title: "主教" },
  { threshold: 1_000_000, level: "Archbishop", title: "大主教" },
  { threshold: 10_000_000, level: "Cardinal", title: "枢机" },
  { threshold: 100_000_000, level: "Singularity Herald", title: "奇点使者" },
  { threshold: 1_000_000_000, level: "Silicon God", title: "硅基之神" }
];

export function getRankForTokens(totalTokens: number): RankResult {
  const safeTokens = Number.isFinite(totalTokens) ? Math.max(0, Math.floor(totalTokens)) : 0;
  let current = RANKS[0];
  let nextAt: number | null = null;

  for (let i = 0; i < RANKS.length; i += 1) {
    const rank = RANKS[i];
    if (safeTokens >= rank.threshold) {
      current = rank;
      nextAt = i < RANKS.length - 1 ? RANKS[i + 1].threshold : null;
      continue;
    }
    break;
  }

  return {
    level: current.level,
    title: `${current.level} (${current.title})`,
    nextAt
  };
}
