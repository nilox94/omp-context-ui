import type { CategoryId, ContextMessageNode, ContextTree } from "./types";

export interface VisibleTreeRow {
	id: string;
	categoryId: CategoryId;
	depth: number;
	label: string;
	tokens: number;
	hasChildren: boolean;
	expanded: boolean;
	parentId: string | null;
}

export interface TreeNavigatorOptions {
	/** Category ids expanded on open. Defaults to every category except Messages. */
	expandCategoryIds?: string[];
}

export class TreeNavigator {
	readonly #tree: ContextTree;
	readonly #expanded = new Set<string>();
	#selectedId: string | null;

	constructor(tree: ContextTree, options: TreeNavigatorOptions = {}) {
		this.#tree = tree;
		const defaultExpanded =
			options.expandCategoryIds ??
			tree.categories
				.filter((category) => category.id !== "messages")
				.map((category) => category.id);
		for (const id of defaultExpanded) this.#expanded.add(id);
		this.#selectedId = tree.categories[0]?.id ?? null;
	}

	get selectedId(): string | null {
		return this.#selectedId;
	}

	getVisibleRows(): VisibleTreeRow[] {
		const rows: VisibleTreeRow[] = [];

		for (const category of this.#tree.categories) {
			const hasChildren = category.children.length > 0;
			const expanded = hasChildren && this.#expanded.has(category.id);
			rows.push({
				id: category.id,
				categoryId: category.id,
				depth: 0,
				label: category.label,
				tokens: category.tokens,
				hasChildren,
				expanded,
				parentId: null,
			});
			if (!expanded) continue;

			if (category.id === "messages") {
				this.#appendMessageRows(
					category.children as ContextMessageNode[],
					category.id,
					1,
					rows,
				);
			} else {
				for (const leaf of category.children) {
					rows.push({
						id: leaf.id,
						categoryId: category.id,
						depth: 1,
						label: leaf.label,
						tokens: leaf.tokens,
						hasChildren: false,
						expanded: false,
						parentId: category.id,
					});
				}
			}
		}

		return rows;
	}

	#appendMessageRows(
		messages: readonly ContextMessageNode[],
		parentId: string,
		depth: number,
		rows: VisibleTreeRow[],
	): void {
		const categoryId: CategoryId = "messages";
		for (const message of messages) {
			const hasChildren = message.blocks.length > 0;
			const expanded = hasChildren && this.#expanded.has(message.id);
			rows.push({
				id: message.id,
				categoryId,
				depth,
				label: message.label,
				tokens: message.tokens,
				hasChildren,
				expanded,
				parentId,
			});
			if (!expanded) continue;
			for (const block of message.blocks) {
				rows.push({
					id: block.id,
					categoryId,
					depth: depth + 1,
					label: block.label,
					tokens: block.tokens,
					hasChildren: false,
					expanded: false,
					parentId: message.id,
				});
			}
		}
	}

	moveSelection(delta: number): void {
		const rows = this.getVisibleRows();
		if (rows.length === 0) {
			this.#selectedId = null;
			return;
		}

		const currentIndex = rows.findIndex((row) => row.id === this.#selectedId);
		const startIndex = currentIndex === -1 ? 0 : currentIndex;
		const nextIndex = Math.max(
			0,
			Math.min(rows.length - 1, startIndex + delta),
		);
		this.#selectedId = rows[nextIndex]?.id ?? null;
	}

	expandSelected(): void {
		if (!this.#selectedId) return;
		const row = this.getVisibleRows().find(
			(candidate) => candidate.id === this.#selectedId,
		);
		if (row?.hasChildren) this.#expanded.add(this.#selectedId);
	}

	collapseSelected(): void {
		if (!this.#selectedId) return;
		this.#expanded.delete(this.#selectedId);
	}

	back(): "parent" | "close" {
		if (!this.#selectedId) return "close";
		const row = this.getVisibleRows().find(
			(candidate) => candidate.id === this.#selectedId,
		);
		if (!row) return "close";
		if (row.parentId === null) return "close";
		this.#selectedId = row.parentId;
		return "parent";
	}
}
