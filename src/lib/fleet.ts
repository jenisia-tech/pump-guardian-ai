import { useSyncExternalStore } from "react";
import { CATALOG } from "./data";

export interface FleetPump {
  id: string;
  model: string;
  name: string;
  hp: number;
  kw: number;
  addedAt: number;
  active: boolean;
}

const KEY = "centriguard.fleet";
const ACTIVE_ID = "cg-30chw";

function defaultFleet(): FleetPump[] {
  const item = CATALOG.find((c) => c.id === ACTIVE_ID);
  if (!item) return [];
  return [
    {
      id: item.id,
      model: item.model,
      name: item.name,
      hp: item.hp,
      kw: item.kw,
      addedAt: Date.now(),
      active: true,
    },
  ];
}

function read(): FleetPump[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as FleetPump[];
  } catch {
    /* noop */
  }
  return defaultFleet();
}

let fleet: FleetPump[] = read();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(fleet));
  } catch {
    /* noop */
  }
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getSnapshot(): FleetPump[] {
  return fleet;
}

export function toggleFleet(id: string) {
  const item = CATALOG.find((c) => c.id === id);
  if (!item) return;
  if (fleet.some((p) => p.id === id)) {
    fleet = fleet.filter((p) => p.id !== id);
  } else {
    fleet = [
      ...fleet,
      {
        id: item.id,
        model: item.model,
        name: item.name,
        hp: item.hp,
        kw: item.kw,
        addedAt: Date.now(),
        active: id === ACTIVE_ID,
      },
    ];
  }
  persist();
  emit();
}

export function isInFleet(id: string): boolean {
  return fleet.some((p) => p.id === id);
}

export function useFleet(): FleetPump[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
