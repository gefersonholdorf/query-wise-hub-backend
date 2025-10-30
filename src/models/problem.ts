export interface Problem {
	id: string;
	vector: number[];
	payload?: {
		problem: string;
		knowledgeId: number;
		createdAt: string;
	};
}

export interface ProblemResult {
	id: string;
	version: number;
	score: number;
	payload: {
		problem: string;
		knowledgeId: number;
		createdAt: string;
	};
}

export interface ProblemPayloadResult {
	id: string;
	payload: {
		problem: string;
		knowledgeId: number;
		createdAt: string;
	};
}
