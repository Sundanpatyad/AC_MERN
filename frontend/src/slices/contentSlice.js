import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';
import { studyMaterialEndPoints } from '../services/apis';

const { FETCH_EXAMS , STUDY_MATERIALS , CREATE_EXAM ,CREATE_STUDY_MATERIAL , DELETE_EXAM ,DELETE_STUDY_MATERIALS } = studyMaterialEndPoints;

const API_BASE_URL = 'http://localhost:8000/api/v1/materials';

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
            `${API_BASE_URL}/updateExam/${id}`,
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
            `${API_BASE_URL}/updateStudyMaterial/${id}`,
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
                toast.success('Exams loaded successfully');
            })
            .addCase(fetchExams.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
                toast.error(`Failed to load exams: ${action.error.message}`);
            })
            .addCase(fetchStudyMaterials.fulfilled, (state, action) => {
                state.studyMaterials = action.payload;
                toast.success('Study materials loaded successfully');
            })
            .addCase(fetchStudyMaterials.rejected, (state, action) => {
                toast.error(`Failed to load study materials: ${action.error.message}`);
            })
            .addCase(createExam.fulfilled, (state, action) => {
                state.exams.push(action.payload);
                state.selectedExamId = action.payload._id;
                state.contentType = 'studyMaterial';
                toast.success('Exam created successfully');
            })
            .addCase(createExam.rejected, (state, action) => {
                toast.error(`Failed to create exam: ${action.error.message}`);
            })
            .addCase(createStudyMaterial.fulfilled, (state, action) => {
                state.studyMaterials.push(action.payload);
                toast.success('Study material created successfully');
            })
            .addCase(createStudyMaterial.rejected, (state, action) => {
                toast.error(`Failed to create study material: ${action.error.message}`);
            })
            .addCase(updateExam.fulfilled, (state, action) => {
                const index = state.exams.findIndex(exam => exam._id === action.payload._id);
                if (index !== -1) {
                    state.exams[index] = action.payload;
                }
                toast.success('Exam updated successfully');
            })
            .addCase(updateExam.rejected, (state, action) => {
                toast.error(`Failed to update exam: ${action.error.message}`);
            })
            .addCase(updateStudyMaterial.fulfilled, (state, action) => {
                const index = state.studyMaterials.findIndex(material => material._id === action.payload._id);
                if (index !== -1) {
                    state.studyMaterials[index] = action.payload;
                }
                toast.success('Study material updated successfully');
            })
            .addCase(updateStudyMaterial.rejected, (state, action) => {
                toast.error(`Failed to update study material: ${action.error.message}`);
            })
            .addCase(deleteExam.fulfilled, (state, action) => {
                state.exams = state.exams.filter(exam => exam._id !== action.payload);
                toast.success('Exam deleted successfully');
            })
            .addCase(deleteExam.rejected, (state, action) => {
                toast.error(`Failed to delete exam: ${action.error.message}`);
            })
            .addCase(deleteStudyMaterial.fulfilled, (state, action) => {
                state.studyMaterials = state.studyMaterials.filter(material => material._id !== action.payload);
                toast.success('Study material deleted successfully');
            })
            .addCase(deleteStudyMaterial.rejected, (state, action) => {
                toast.error(`Failed to delete study material: ${action.error.message}`);
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