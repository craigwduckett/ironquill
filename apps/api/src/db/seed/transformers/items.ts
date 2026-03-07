/**
 * Transformers for SRD items (equipment + magic items).
 *
 * 2014: Standard equipment (weapons, armor, gear) + magic items from SRD 5.1.
 * 2024: Equipment from SRD 5.2 (CC-BY-4.0). Magic items not yet in 5e-bits DB.
 *
 * The itemCategoryEnum values are: weapon | armor | adventuring_gear | tool | magic_item
 */

import type { itemCategoryEnum } from '../../schema/srd.js';

type ItemCategory = (typeof itemCategoryEnum.enumValues)[number];

// ── 2014 equipment ────────────────────────────────────────────────────────────

type RawEquipmentCategory2014 = { index: string; name: string };

export type RawEquipment2014 = {
  index: string;
  name: string;
  equipment_category: RawEquipmentCategory2014;
  cost?: { quantity: number; unit: string };
  weight?: number;
  desc?: string[];
  weapon_category?: string;
  weapon_range?: string;
  damage?: { damage_dice: string; damage_type?: { name: string } };
  armor_class?: {
    base: number;
    dex_bonus?: boolean;
    max_bonus?: number | null;
  };
  str_minimum?: number;
  stealth_disadvantage?: boolean;
  properties?: Array<{ index: string; name: string }>;
};

function mapEquipmentCategory2014(raw: RawEquipment2014): ItemCategory {
  const idx = raw.equipment_category.index;
  if (idx === 'weapon') return 'weapon';
  if (idx === 'armor') return 'armor';
  if (idx === 'tools') return 'tool';
  return 'adventuring_gear';
}

export function transformEquipment2014(raw: RawEquipment2014) {
  const category = mapEquipmentCategory2014(raw);
  const props: Record<string, unknown> = {};

  if (raw.weapon_category) props.weapon_category = raw.weapon_category;
  if (raw.weapon_range) props.weapon_range = raw.weapon_range;
  if (raw.damage) props.damage = raw.damage;
  if (raw.armor_class) props.armor_class = raw.armor_class;
  if (raw.str_minimum) props.str_minimum = raw.str_minimum;
  if (raw.stealth_disadvantage) props.stealth_disadvantage = raw.stealth_disadvantage;
  if (raw.properties?.length) props.weapon_properties = raw.properties.map((p) => p.name);

  return {
    sourceEdition: '2014' as const,
    name: raw.name,
    category,
    cost: raw.cost ? { amount: raw.cost.quantity, unit: raw.cost.unit } : null,
    weight: raw.weight ?? null,
    properties: Object.keys(props).length ? props : null,
    description: raw.desc?.join('\n') ?? '',
    rarity: null,
    requiresAttunement: false,
  };
}

// ── 2014 magic items ──────────────────────────────────────────────────────────

type RawMagicItemCategory2014 = { index: string; name: string };

export type RawMagicItem2014 = {
  index: string;
  name: string;
  equipment_category: RawMagicItemCategory2014;
  rarity?: { name: string };
  desc?: string[];
  requires_attunement?: boolean | string;
};

function parseAttunement(raw: RawMagicItem2014): boolean {
  if (!raw.requires_attunement) return false;
  if (typeof raw.requires_attunement === 'boolean') return raw.requires_attunement;
  return raw.requires_attunement !== 'no';
}

export function transformMagicItem2014(raw: RawMagicItem2014) {
  return {
    sourceEdition: '2014' as const,
    name: raw.name,
    category: 'magic_item' as const,
    cost: null,
    weight: null,
    properties: null,
    description: raw.desc?.join('\n') ?? '',
    rarity: raw.rarity?.name ?? null,
    requiresAttunement: parseAttunement(raw),
  };
}

// ── 2024 equipment ────────────────────────────────────────────────────────────

type RawEquipmentCategory2024 = { index: string; name: string };

export type RawEquipment2024 = {
  index: string;
  name: string;
  equipment_categories: RawEquipmentCategory2024[];
  cost?: { quantity: number; unit: string };
  weight?: number;
  description?: string;
  damage?: { damage_dice: string; damage_type?: { name: string } };
  armor_class?: { base: number; dex_bonus?: boolean };
  properties?: Array<{ index: string; name: string }>;
};

function mapEquipmentCategory2024(raw: RawEquipment2024): ItemCategory {
  const indices = raw.equipment_categories.map((c) => c.index);
  if (indices.includes('weapons')) return 'weapon';
  if (indices.includes('armor')) return 'armor';
  if (indices.includes('tools')) return 'tool';
  return 'adventuring_gear';
}

export function transformEquipment2024(raw: RawEquipment2024) {
  const category = mapEquipmentCategory2024(raw);
  const props: Record<string, unknown> = {};

  if (raw.damage) props.damage = raw.damage;
  if (raw.armor_class) props.armor_class = raw.armor_class;
  if (raw.properties?.length) props.weapon_properties = raw.properties.map((p) => p.name);

  return {
    sourceEdition: '2024' as const,
    name: raw.name,
    category,
    cost: raw.cost ? { amount: raw.cost.quantity, unit: raw.cost.unit } : null,
    weight: raw.weight ?? null,
    properties: Object.keys(props).length ? props : null,
    description: raw.description ?? '',
    rarity: null,
    requiresAttunement: false,
  };
}
