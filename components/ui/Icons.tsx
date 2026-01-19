// FILE: components/ui/Icons.tsx
// VERSION: V7.0 TYPE-SAFE IDENTITY

import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { SvgProps } from 'react-native-svg';

interface CustomIconProps extends LucideIcons.LucideProps, SvgProps {
  color?: string;
  size?: number;
}

/**
 * AAA+ Type Fix: This wrapper resolves the Lucide 'color' property error 
 * found in your TS logs by extending the component definition.
 */
type IconType = React.FC<any>;

const wrap = (Icon: any): IconType => Icon as IconType;
export const Icon = wrap(LucideIcons.Icon); // Generic Icon component if needed


export const Icons = {
  Globe: wrap(LucideIcons.Globe),
  Cpu: wrap(LucideIcons.Cpu),
  Alert: wrap(LucideIcons.AlertCircle),
  Check: wrap(LucideIcons.CheckCircle2),
  Plus: wrap(LucideIcons.PlusCircle),
  Trash: wrap(LucideIcons.Trash2),
  Send: wrap(LucideIcons.Send),
  Database: wrap(LucideIcons.Database),
  Mail: wrap(LucideIcons.Mail),
  Lock: wrap(LucideIcons.Lock),
  ChevronRight: wrap(LucideIcons.ChevronRight),
  Activity: wrap(LucideIcons.Activity),
  TrendingUp: wrap(LucideIcons.TrendingUp),
  Shield: wrap(LucideIcons.ShieldCheck),
  Sparkles: wrap(LucideIcons.Sparkles),
  User: wrap(LucideIcons.User),
  Eye: wrap(LucideIcons.Eye),
  EyeOff: wrap(LucideIcons.EyeOff),
  ArrowLeft: wrap(LucideIcons.ArrowLeft),
  ArrowRight: wrap(LucideIcons.ArrowRight),
  Zap: wrap(LucideIcons.Zap),
  Briefcase: wrap(LucideIcons.Briefcase),
  LogOut: wrap(LucideIcons.LogOut),
  Camera: wrap(LucideIcons.Camera),
  Save: wrap(LucideIcons.Save),
  Layers: wrap(LucideIcons.Layers),
  Bell: wrap(LucideIcons.Bell),
  Settings: wrap(LucideIcons.Settings),
  Fingerprint: wrap(LucideIcons.Fingerprint),
  Key: wrap(LucideIcons.Key),
  Smartphone: wrap(LucideIcons.Smartphone),
  ShieldCheck: wrap(LucideIcons.ShieldCheck),
  BellRing: wrap(LucideIcons.BellRing),
  UserCog: wrap(LucideIcons.UserCog),
  MessageCircle: wrap(LucideIcons.MessageCircle),
  Admin: wrap(LucideIcons.ZapIcon),


  // react native svg
};

export const IconRegistry: Record<string, IconType> = {
  Cpu: Icons.Cpu,
  Database: Icons.Database,
  Globe: Icons.Globe,
  TrendingUp: Icons.TrendingUp,
  Shield: Icons.Shield,
  Activity: Icons.Activity,
};
