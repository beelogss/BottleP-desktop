const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, writeBatch } = require('firebase/firestore');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { getAuth, signInWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyCNBtOJqXJXiSbEZLO83DJ1oq2etkKUbI4",
  authDomain: "bpts-34c54.firebaseapp.com",
  projectId: "bpts-34c54",
  storageBucket: "bpts-34c54.appspot.com",
  messagingSenderId: "320960896346",
  appId: "1:320960896346:web:7cb35f9324c9c2d7a7a763",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
async function getUserCountFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching user count from Firestore:', error);
    throw error; // Throw error so it can be caught in the handler below
  }
}

async function getClaimedRewardsCount() {
  try {
    const querySnapshot = await getDocs(collection(db, 'claimedRewards')); // Updated to 'claimedRewards'
    console.log(`Number of claimed rewards fetched: ${querySnapshot.size}`); // Log the count for debugging
    return querySnapshot.size;
  } catch (error) {
    console.error('Error fetching claimed rewards count:', error);
    return { error: 'Failed to fetch claimed rewards count' };
  }
}

async function getTotalBottleCount() {
  try {
    const querySnapshot = await getDocs(collection(db, 'userPoints'));
    let totalBottleCount = 0;
    querySnapshot.forEach(doc => {
      const data = doc.data();
      totalBottleCount += data.bottleCount;
    });
    return totalBottleCount;
  } catch (error) {
    console.error('Error fetching total bottle count:', error);
    return 0; // Return 0 on error to avoid disrupting the UI
  }
}


async function getTotalBottleWeight() {
  try {
    const querySnapshot = await getDocs(collection(db, 'userPoints'));
    let totalWeight = 0;
    
    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.totalWeight) {
        totalWeight += parseFloat(data.totalWeight);
      }
    });
    
    return totalWeight;
  } catch (error) {
    console.error('Error fetching total bottle weight:', error);
    throw error;
  }
}


async function getDataFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return data;
  } catch (error) {
    console.error('Error fetching Firestore data:', error);
    throw error;
  }
}



// Edit user data in Firestore
async function editUserFromFirestore(userId, studentNumber, name, email) {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      studentNumber: studentNumber,
      name: name,
      email: email
    });
    console.log('User successfully updated in Firebase!');
  } catch (error) {
    console.error('Error editing user in Firebase:', error);
    throw error;
  }
}

async function deleteUserFromFirestore(userId) {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user from Firestore:', error);
    throw error;
  }
}

async function uploadImage(fileBuffer, fileName) {
  try {
    const storageRef = ref(storage, `rewards/${fileName}`);
    const snapshot = await uploadBytes(storageRef, fileBuffer);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

async function addRewardToFirestore(reward) {
  try {
    await addDoc(collection(db, 'rewards'), reward);
  } catch (error) {
    console.error('Error adding reward to Firestore:', error);
    throw error;
  }
}

async function getRewardsFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, 'rewards'));
    const rewards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return rewards;
  } catch (error) {
    console.error('Error fetching rewards from Firestore:', error);
    throw error;
  }
}

async function editRewardFromFirestore(rewardId, rewardName, stock, points) {
  try {
    const rewardRef = doc(db, 'rewards', rewardId);
    await updateDoc(rewardRef, {
      reward_name: rewardName,
      stock: Number(stock),
      points: Number(points)
    });
    console.log('Reward successfully updated in Firebase!');
    return { success: true };
  } catch (error) {
    console.error('Error editing reward in Firebase:', error);
    throw error;
  }
}

async function deleteRewardFromFirestore(rewardId) {
  try {
    const rewardRef = doc(db, 'rewards', rewardId);
    await deleteDoc(rewardRef);
    console.log('Reward successfully deleted from Firebase!');
  } catch (error) {
    console.error('Error deleting reward from Firebase:', error);
    throw error;
  }
}

async function uploadPetBottleImage(fileBuffer, fileName) {
  try {
    const storageRef = ref(storage, `petBottles/${fileName}`);
    const snapshot = await uploadBytes(storageRef, fileBuffer);
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('Pet bottle image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading pet bottle image:', error);
    throw error;
  }
}

async function addPetBottleToFirestore(petBottle) {
  try {
    await addDoc(collection(db, 'petBottles'), petBottle);
  } catch (error) {
    console.error('Error adding pet bottle to Firestore:', error);
    throw error;
  }
}

async function getPetBottlesFromFirestore() {
  try {
    const bottles = [];
    const snapshot = await getDocs(collection(db, 'petBottles'));
    snapshot.forEach(doc => {
      bottles.push({ id: doc.id, ...doc.data() });
    });
    return bottles;
  } catch (error) {
    console.error('Error fetching bottles:', error);
    throw error;
  }
}

async function editPetBottleInFirestore(petBottleId, brandName, size, sizeUnit, weight, weightUnit, barcodeNumber, points) {
  try {
    const petBottleRef = doc(db, 'petBottles', petBottleId);
    await updateDoc(petBottleRef, {
      brand_name: brandName,
      size: size,
      size_unit: sizeUnit,
      weight: weight,
      weight_unit: weightUnit,
      barcode_number: barcodeNumber,
      points: points,
    });
    console.log('Pet bottle successfully updated in Firebase!');
  } catch (error) {
    console.error('Error editing pet bottle in Firebase:', error);
    throw error;
  }
}

async function deletePetBottleFromFirestore(petBottleId) {
  try {
    const petBottleRef = doc(db, 'petBottles', petBottleId);
    await deleteDoc(petBottleRef);
    console.log('Pet bottle successfully deleted from Firestore!');
  } catch (error) {
    console.error('Error deleting pet bottle from Firestore:', error);
    throw error;
  }
}

// Function to add a claimed reward to Firestore
async function addClaimedReward(reward) {
  try {
    const claimedRewardsCollection = collection(db, 'claimedRewards');
    const docRef = await addDoc(claimedRewardsCollection, reward);
    return docRef; // Return the document reference
  } catch (error) {
    console.error('Error adding claimed reward:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

// Function to get all claimed rewards from Firestore
async function getClaimedRewards() {
  try {
    const claimedRewardsCollection = collection(db, 'claimedRewards');
    const claimedRewardsSnapshot = await getDocs(claimedRewardsCollection);

    const claimedRewards = claimedRewardsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return claimedRewards;
  } catch (error) {
    console.error('Error fetching claimed rewards:', error);
    return [];
  }
}

// Function to update the status of a claimed reward in Firestore// Function to update the status of a claimed reward in Firestore
async function updateClaimedRewardStatus(rewardId, status, claimedAt) {
  try {
    const rewardDoc = doc(db, 'claimedRewards', rewardId);
    await updateDoc(rewardDoc, { status, claimedAt });
  } catch (error) {
    console.error('Error updating claimed reward status:', error);
    throw error; // Rethrow the error to handle it in the calling function
  }
}

// Function to delete a claimed reward from Firestore
async function deleteClaimedReward(rewardId) {
  try {
    const rewardDoc = doc(db, 'claimedRewards', rewardId);
    await deleteDoc(rewardDoc);
  } catch (error) {
    console.error('Error deleting claimed reward:', error);
    throw error;
  }
}

async function verifyRFID(rfidCode) {
  try {
    const q = query(collection(db, 'rfidCodes'), where('code', '==', rfidCode));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error verifying RFID code:', error);
    throw error;
  }
}

async function addUserPointToFirestore(user) {
  try {
    await addDoc(collection(db, 'userPoints'), user);
  } catch (error) {
    console.error('Error adding user points to Firestore:', error);
    throw error;
  }
}

async function getUserPointsFromFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, 'userPoints'));
    const userPoints = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return userPoints;
  } catch (error) {
    console.error('Error fetching user points from Firestore:', error);
    throw error;
  }
}

async function updateClaimedRewardAvailability(rewardId, availability) {
    try {
        const rewardRef = doc(db, 'claimedRewards', rewardId);
        await updateDoc(rewardRef, {
            availability: availability
        });
        console.log(`Successfully updated reward ${rewardId} to ${availability}`);
    } catch (error) {
        console.error('Error updating reward availability:', error);
        throw error;
    }
}

// Add this new function to update all existing records
async function updateExistingClaimedRewards() {
    try {
        const claimedRewardsRef = collection(db, 'claimedRewards');
        const querySnapshot = await getDocs(claimedRewardsRef);
        
        // Update each document that doesn't have an availability field
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!data.availability) {
                const docRef = doc.ref;
                batch.update(docRef, { availability: 'Pending' });
            }
        });

        await batch.commit();
        console.log('Successfully updated existing claimed rewards');
    } catch (error) {
        console.error('Error updating existing claimed rewards:', error);
        throw error;
    }
}

async function getReportsFromFirestore() {
    try {
        const reportsRef = collection(db, 'reports');
        const querySnapshot = await getDocs(reportsRef);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error fetching reports:', error);
        throw error;
    }
}

async function updateReportStatus(reportId, status, adminResponse) {
    try {
        const reportRef = doc(db, 'reports', reportId);
        await updateDoc(reportRef, {
            status,
            adminResponse,
            updatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error updating report:', error);
        throw error;
    }
}

async function calculateTotalRevenue() {
    try {
        const totalWeight = await getTotalBottleWeight(); // Get total weight in grams
        const pricePerKg = 18; // 18 pesos per kg
        const revenueInPesos = (totalWeight / 1000) * pricePerKg; // Convert grams to kg and multiply by price
        return revenueInPesos;
    } catch (error) {
        console.error('Error calculating total revenue:', error);
        throw error;
    }
}

async function getBottleTransactions() {
    try {
        const userPoints = await getUserPointsFromFirestore();
        const transactions = userPoints.map(doc => {
            // Get the timestamp and format it as YYYYMMDD
            const timestamp = doc.timestamp ? new Date(doc.timestamp) : new Date();
            const dateStr = timestamp.toISOString().split('T')[0].replace(/-/g, '');
            
            // Ensure we get the weight value
            const totalWeight = doc.totalWeight || 0;
            
            // Calculate amount based on weight (18 pesos per kg)
            const weightInKg = totalWeight / 1000;
            const amount = weightInKg * 18;

            return {
                transactionId: `TXN-${dateStr}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                date: timestamp,
                studentNumber: doc.studentNumber || '',
                name: doc.name || '',
                bottleCount: doc.bottleCount || 0,
                totalWeight: totalWeight, // Make sure we're including the weight
                points: doc.totalPoints || 0,
                amount: amount,
                status: 'Completed'
            };
        });

        console.log('Transactions with weights:', transactions); // Debug log
        return transactions;
    } catch (error) {
        console.error('Error getting bottle transactions:', error);
        throw error;
    }
}

async function validateAdminCredentials(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: userCredential.user };
    } catch (error) {
        console.error('Error validating admin credentials:', error);
        throw error;
    }
}

async function updateAdminPassword(email, currentPassword, newPassword) {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('No user is currently signed in');
        }

        // Reauthenticate first
        const credential = EmailAuthProvider.credential(email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Then update password
        await updatePassword(user, newPassword);
        return { success: true };
    } catch (error) {
        console.error('Error updating admin password:', error);
        throw error;
    }
}

module.exports = {
  getUserCountFromFirestore,
  getClaimedRewardsCount,
  getTotalBottleCount,
  getTotalBottleWeight,

  getDataFromFirestore,
  editUserFromFirestore,
  deleteUserFromFirestore,

  uploadImage,
  addRewardToFirestore,
  getRewardsFromFirestore,
  editRewardFromFirestore,
  deleteRewardFromFirestore,

  uploadPetBottleImage,
  addPetBottleToFirestore,
  getPetBottlesFromFirestore,
  editPetBottleInFirestore,
  deletePetBottleFromFirestore,

  addClaimedReward,
  getClaimedRewards,
  updateClaimedRewardStatus,
  deleteClaimedReward,

  auth,
  signInWithEmailAndPassword,
  verifyRFID,

  addUserPointToFirestore,
  getUserPointsFromFirestore,

  updateClaimedRewardAvailability,

  updateExistingClaimedRewards,

  getReportsFromFirestore,
  updateReportStatus,

  calculateTotalRevenue,
  getBottleTransactions,

  validateAdminCredentials,
  updateAdminPassword,
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
};