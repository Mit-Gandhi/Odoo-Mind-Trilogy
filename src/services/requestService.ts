import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  and
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface SkillRequest {
  id?: string;
  fromUserId: string;
  fromUserName: string;
  fromUserPhoto: string;
  toUserId: string;
  toUserName: string;
  offeredSkill: string;
  wantedSkill: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: any;
  updatedAt: any;
  isRead?: boolean;
}

export const createRequest = async (requestData: Omit<SkillRequest, 'id' | 'createdAt' | 'updatedAt' | 'isRead'>): Promise<void> => {
  const requestsRef = collection(db, 'requests');
  await addDoc(requestsRef, {
    ...requestData,
    isRead: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const getReceivedRequests = async (userId: string): Promise<SkillRequest[]> => {
  const requestsRef = collection(db, 'requests');
  const q = query(
    requestsRef,
    where('toUserId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  const requests = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SkillRequest));
  
  // Sort by createdAt in JavaScript instead of Firestore
  return requests.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
};

export const getSentRequests = async (userId: string): Promise<SkillRequest[]> => {
  const requestsRef = collection(db, 'requests');
  const q = query(
    requestsRef,
    where('fromUserId', '==', userId)
  );
  
  const querySnapshot = await getDocs(q);
  const requests = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SkillRequest));
  
  // Sort by createdAt in JavaScript instead of Firestore
  return requests.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
};

export const updateRequestStatus = async (requestId: string, status: 'accepted' | 'rejected'): Promise<void> => {
  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, {
    status,
    updatedAt: serverTimestamp()
  });
};

export const markRequestAsRead = async (requestId: string): Promise<void> => {
  const requestRef = doc(db, 'requests', requestId);
  await updateDoc(requestRef, {
    isRead: true,
    updatedAt: serverTimestamp()
  });
};

export const hasAcceptedRequest = async (fromUserId: string, toUserId: string): Promise<boolean> => {
  const requestsRef = collection(db, 'requests');
  const q = query(
    requestsRef,
    and(
      where('fromUserId', '==', fromUserId),
      where('toUserId', '==', toUserId),
      where('status', '==', 'accepted')
    )
  );
  
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

export const getAllRequests = async (): Promise<SkillRequest[]> => {
  const requestsRef = collection(db, 'requests');
  const querySnapshot = await getDocs(requestsRef);
  
  const requests = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as SkillRequest));
  
  // Sort by createdAt in JavaScript instead of Firestore
  return requests.sort((a, b) => {
    const aTime = a.createdAt?.toDate?.() || new Date(0);
    const bTime = b.createdAt?.toDate?.() || new Date(0);
    return bTime.getTime() - aTime.getTime();
  });
};

export const subscribeToRequests = (userId: string, callback: (requests: SkillRequest[]) => void): Unsubscribe => {
  const requestsRef = collection(db, 'requests');
  const q = query(
    requestsRef,
    where('toUserId', '==', userId)
  );
  
  return onSnapshot(q, (querySnapshot) => {
    let requests = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as SkillRequest));
    
    // Sort by createdAt in JavaScript instead of Firestore
    requests = requests.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.() || new Date(0);
      const bTime = b.createdAt?.toDate?.() || new Date(0);
      return bTime.getTime() - aTime.getTime();
    });
    
    callback(requests);
  });
};