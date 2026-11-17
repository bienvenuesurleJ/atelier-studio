import type { Block, BlockData, ListItem } from './types'
import { uid } from './ids'

export function field(block: Block, key: string): string {
  return block.data.fields[key] ?? ''
}

export function list(block: Block, key: string): ListItem[] {
  return block.data.lists[key] ?? []
}

export function item(fields: Record<string, string>): ListItem {
  return { id: uid('item'), fields }
}

export function data(
  fields: Record<string, string>,
  lists: Record<string, ListItem[]> = {},
): BlockData {
  return { fields, lists }
}
