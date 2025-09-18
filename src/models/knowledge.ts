export interface KnowledgeBase {
	id: string;
	vector: number[];
	payload?: {
		problem: string;
		solution: string;
	};
}

export interface KnowledgeBaseResult {
	id: string;
	version: number;
	score: number;
	payload: {
		problem: string;
		solution: string;
	};
}
