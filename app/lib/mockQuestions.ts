export type QuestionType = 'MCQ' | 'MATCH';

export function parseBulkQuestions(text: string, questionType: 'mcq' | 'match') {
  const lines = text
    .trim()
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const questions: any[] = [];
  let i = 0;

  if (questionType === 'match') {
    while (i < lines.length) {
      const questionText = lines[i];
      const leftColumn = lines.slice(i + 1, i + 5);
      const rightColumn = lines.slice(i + 5, i + 9);
      const options = lines.slice(i + 9, i + 14);
      const correctAnswer = options[4] || '';
      if (leftColumn.length === 4 && rightColumn.length === 4 && options.length === 5 && correctAnswer) {
        questions.push({
          text: questionText,
          questionType: 'MATCH',
          leftColumn,
          rightColumn,
          options,
          correctAnswer,
        });
      }
      i += 14;
    }
    return questions;
  }

  while (i < lines.length) {
    const questionText = lines[i];
    const options = lines.slice(i + 1, i + 5);
    const correctAnswer = lines[i + 5] || '';
    if (options.length === 4 && correctAnswer) {
      questions.push({
        text: questionText,
        questionType: 'MCQ',
        options,
        correctAnswer,
      });
    }
    i += 6;
  }
  return questions;
}

export function normalizeOption(opt: any) {
  if (typeof opt === 'string') return { text: opt, image: '' };
  return { text: opt?.text || '', image: opt?.image || '' };
}

export function emptyMcq() {
  return {
    text: '',
    questionImage: '',
    questionType: 'MCQ',
    options: [
      { text: '', image: '' },
      { text: '', image: '' },
      { text: '', image: '' },
      { text: '', image: '' },
    ],
    correctAnswer: '',
  };
}

export function serializeSeries(series: any) {
  return {
    seriesName: series.seriesName,
    description: series.description,
    price: Number(series.price) || 0,
    status: series.status || 'draft',
    mockTests: (series.mockTests || []).map((test: any) => ({
      testName: test.testName,
      duration: Number(test.duration) || 0,
      negative: Number(test.negative) || 0,
      status: test.status || 'draft',
      questions: (test.questions || []).map((question: any) => {
        const base: any = {
          text: question.text || '',
          questionImage: question.questionImage || '',
          questionType: question.questionType || 'MCQ',
          options: (question.options || []).map(normalizeOption),
          correctAnswer: question.correctAnswer,
        };
        if (question.questionType === 'MATCH') {
          base.leftColumn = question.leftColumn || [];
          base.rightColumn = question.rightColumn || [];
        }
        return base;
      }),
    })),
    attachments: series.attachments || [],
  };
}
