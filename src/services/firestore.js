import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    deleteDoc,
    doc,
    serverTimestamp,
    updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

const APP_ID = 'stock-journal-default'; // In real app, this might be dynamic

export const getTradeLogsQuery = (userId) => {
    return query(
        collection(db, 'artifacts', APP_ID, 'users', userId, 'trade_logs'),
        orderBy('date', 'desc')
    );
};

export const addTradeLog = async (userId, data) => {
    return addDoc(collection(db, 'artifacts', APP_ID, 'users', userId, 'trade_logs'), {
        ...data,
        createdAt: serverTimestamp()
    });
};

export const deleteTradeLog = async (userId, logId) => {
    return deleteDoc(doc(db, 'artifacts', APP_ID, 'users', userId, 'trade_logs', logId));
};

export const updateTradeLog = async (userId, logId, data) => {
    return updateDoc(doc(db, 'artifacts', APP_ID, 'users', userId, 'trade_logs', logId), data);
};
