import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from '@/utils/toast';
import { studyMaterialEndPoints } from '../services/apis';

const {
    FETCH_EXAMS,
    STUDY_MATERIALS,
    CREATE_EXAM,
    CREATE_STUDY_MATERIAL,
    UPDATE_EXAM,
    UPDATE_STUDY_MATERIAL,
    DELETE_EXAM,
    DELETE_STUDY_MATERIALS,
} = studyMaterialEndPoints;


export const fetchExams = createAsyncThunk('content/fetchExams', async () => {
    const response = await axios.get(FETCH_EXAMS);
    return response.data;
});

export const fetchStudyMaterials = createAsyncThunk('content/fetchStudyMaterials', async () => {
    const response = await axios.get(STUDY_MATERIALS);
    return response.data;
});

export const createExam = createAsyncThunk('content/createExam', async ({ name, description, token }) => {
    const response = await axios.post(CREATE_EXAM, { name, description }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
});

export const createStudyMaterial = createAsyncThunk(
    'content/createStudyMaterial',
    async ({ title, content, exam, token }) => {
        const response = await axios.post(
            `${CREATE_STUDY_MATERIAL}`,
            { title, content, exam },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    }
);

export const updateExam = createAsyncThunk(
    'content/updateExam',
    async ({ id, name, description, token }) => {
        const response = await axios.put(
            `${UPDATE_EXAM}/${id}`,
            { name, description },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    }
);

export const updateStudyMaterial = createAsyncThunk(
    'content/updateStudyMaterial',
    async ({ id, title, content, exam, token }) => {
        const response = await axios.put(
            `${UPDATE_STUDY_MATERIAL}/${id}`,
            { title, content, exam },
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        return response.data;
    }
);

export const deleteExam = createAsyncThunk('content/deleteExam', async ({ id, token }) => {
    await axios.delete(`${DELETE_EXAM}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return id;
});

export const deleteStudyMaterial = createAsyncThunk('content/deleteStudyMaterial', async ({ id, token }) => {
    await axios.delete(`${DELETE_STUDY_MATERIALS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return id;
});

const contentSlice = createSlice({
    name: 'content',
    initialState: {
        contentType: 'exam',
        examName: '',
        examDescription: '',
        materialTitle: '',
        materialContent: '',
        selectedExamId: '',
        exams: [],
        studyMaterials: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        setContentType: (state, action) => {
            state.contentType = action.payload;
        },
        setExamName: (state, action) => {
            state.examName = action.payload;
        },
        setExamDescription: (state, action) => {
            state.examDescription = action.payload;
        },
        setMaterialTitle: (state, action) => {
            state.materialTitle = action.payload;
        },
        setMaterialContent: (state, action) => {
            state.materialContent = action.payload;
        },
        setSelectedExamId: (state, action) => {
            state.selectedExamId = action.payload;
        },
        resetForm: (state) => {
            state.examName = '';
            state.examDescription = '';
            state.materialTitle = '';
            state.materialContent = '';
            state.selectedExamId = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExams.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchExams.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.exams = action.payload;
            })
            .addCase(fetchExams.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;            })
            .addCase(fetchStudyMaterials.fulfilled, (state, action) => {
                state.studyMaterials = action.payload;
            })
            .addCase(fetchStudyMaterials.rejected, (state, action) => {
                toast.error("Couldn't load materials");
            })
            .addCase(createExam.fulfilled, (state, action) => {
                state.exams.push(action.payload);
                state.selectedExamId = action.payload._id;
                state.contentType = 'studyMaterial';
                toast.success('Exam created');
            })
            .addCase(createExam.rejected, (state, action) => {
                toast.error("Couldn't create exam");
            })
            .addCase(createStudyMaterial.fulfilled, (state, action) => {
                state.studyMaterials.push(action.payload);
                toast.success('Material created');
            })
            .addCase(createStudyMaterial.rejected, (state, action) => {
                toast.error("Couldn't create material");
            })
            .addCase(updateExam.fulfilled, (state, action) => {
                const index = state.exams.findIndex(exam => exam._id === action.payload._id);
                if (index !== -1) {
                    state.exams[index] = action.payload;
                }
                toast.success('Exam updated');
            })
            .addCase(updateExam.rejected, (state, action) => {
                toast.error("Couldn't update exam");
            })
            .addCase(updateStudyMaterial.fulfilled, (state, action) => {
                const index = state.studyMaterials.findIndex(material => material._id === action.payload._id);
                if (index !== -1) {
                    state.studyMaterials[index] = action.payload;
                }
                toast.success('Material updated');
            })
            .addCase(updateStudyMaterial.rejected, (state, action) => {
                toast.error("Couldn't update material");
            })
            .addCase(deleteExam.fulfilled, (state, action) => {
                state.exams = state.exams.filter(exam => exam._id !== action.payload);
                toast.success('Exam deleted');
            })
            .addCase(deleteExam.rejected, (state, action) => {
                toast.error("Couldn't delete exam");
            })
            .addCase(deleteStudyMaterial.fulfilled, (state, action) => {
                state.studyMaterials = state.studyMaterials.filter(material => material._id !== action.payload);
                toast.success('Material deleted');
            })
            .addCase(deleteStudyMaterial.rejected, (state, action) => {
                toast.error("Couldn't delete material");
            });
    },
});

export const {
    setContentType,
    setExamName,
    setExamDescription,
    setMaterialTitle,
    setMaterialContent,
    setSelectedExamId,
    resetForm,
} = contentSlice.actions;

export default contentSlice.reducer;