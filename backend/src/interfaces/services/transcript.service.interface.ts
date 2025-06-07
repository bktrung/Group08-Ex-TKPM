export interface ITranscriptService {
	generateTranscript(studentId: string): Promise<any>;
} 