import { Mic, ScanFace, MessageSquareText, Gauge, Shield, Code, Database, Cpu, Zap, Layers, Globe, Lock, type LucideIcon } from 'lucide-react';

// Icons available for a project's "Key Features" (chosen by name in the admin page)
export const featureIcons: Record<string, LucideIcon> = {
  mic: Mic, face: ScanFace, message: MessageSquareText, gauge: Gauge, shield: Shield, code: Code,
  database: Database, cpu: Cpu, zap: Zap, layers: Layers, globe: Globe, lock: Lock,
};
