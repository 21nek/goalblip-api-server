import { Shield, Signal, Layers, Sparkles, type LucideIcon } from 'lucide-react';

const registry: Record<string, LucideIcon> = {
  shield: Shield,
  signal: Signal,
  layers: Layers,
  sparkles: Sparkles
};

export function resolveIcon(name: string): LucideIcon {
  return registry[name] ?? Sparkles;
}
