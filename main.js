const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort, ReadlineParser } = require('serialport');
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
  hardResetMethod: 'exit'
});
const { 
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
  
} = require('./main/firebase');
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    autoHideMenuBar: true,
    minWidth: 800,
    minHeight: 660
  });

  mainWindow.loadFile('renderer/index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// List available COM ports
SerialPort.list().then(ports => {
  ports.forEach(port => {
    console.log(`Port: ${port.path}`);
  });
}).catch(err => {
  console.error('Error listing ports:', err);
});

// Set up serial communication with ESP32
const port = new SerialPort({ path: 'COM3', baudRate: 9600 }, (err) => {
  if (err) {
    return console.error('Error opening COM3:', err.message);
  }
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

parser.on('data', (data) => {
  console.log('Data received from ESP32:', data);
  if (data.includes('bottle_detected') && mainWindow) {
    console.log('Bottle detection confirmed, sending to renderer');
    try {
      mainWindow.webContents.send('bottle-detected');
    } catch (error) {
      console.error('Error sending bottle detection to renderer:', error);
    }
  }
});

port.on('error', (err) => {
  console.error('Serial port error:', err);
});

ipcMain.handle('get-user-count', async () => {
  try {
    const userCount = await getUserCountFromFirestore();
    return userCount;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return { error: 'Failed to fetch user count' };
  }
});

ipcMain.handle('get-claimed-rewards-count', async () => {
  try {
    const claimedCount = await getClaimedRewardsCount();
    return claimedCount;
  } catch (error) {
    console.error('Error in IPC handling of claimed rewards count:', error);
    return { error: 'Failed to fetch claimed rewards count' };
  }
});

ipcMain.handle('getTotalBottleCount', async () => {
  try {
    const totalBottleCount = await getTotalBottleCount();
    return totalBottleCount;
  } catch (error) {
    console.error('Error in IPC handling of total bottle count:', error);
    return 0; // Return 0 on error for consistency
  }
});

// Example usage in an Electron API handler
ipcMain.handle('getTotalBottleWeight', async () => {
  try {
      const totalWeight = await getTotalBottleWeight();
      return totalWeight;
  } catch (error) {
      console.error('Error fetching total bottle weight:', error);
      throw error;
  }
});

ipcMain.handle('get-data', async () => {
  try {
    const data = await getDataFromFirestore();
    return data;
  } catch (error) {
    console.error('Error fetching Firestore data:', error);
    return { error: 'Failed to fetch data' };
  }
});

ipcMain.handle('edit-user', async (event, userId, studentNumber, name, email) => {
  try {
    await editUserFromFirestore(userId, studentNumber, name, email);
    return { success: true };
  } catch (error) {
    console.error('Error editing user:', error);
    return { error: 'Failed to edit user' };
  }
});

ipcMain.handle('delete-user', async (event, userId) => {
  try {
    await deleteUserFromFirestore(userId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { error: 'Failed to delete user' };
  }
});

ipcMain.handle('upload-image', async (event, { fileContent, fileName }) => {
  try {
    const imageUrl = await uploadImage(Buffer.from(fileContent), fileName);
    return { success: true, imageUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { error: 'Failed to upload image' };
  }
});

ipcMain.handle('add-reward', async (event, reward) => {
  try {
    await addRewardToFirestore(reward);
    return { success: true };
  } catch (error) {
    console.error('Error adding reward:', error);
    return { error: 'Failed to add reward' };
  }
});

ipcMain.handle('get-rewards', async () => {
  try {
    const rewards = await getRewardsFromFirestore();
    return rewards;
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return { error: 'Failed to fetch rewards' };
  }
});

ipcMain.handle('edit-reward', async (event, rewardId, rewardName, stock, points) => {
  try {
    await editRewardFromFirestore(rewardId, rewardName, stock, points); // Update Firebase with the new reward details
    return { success: true };
  } catch (error) {
    console.error('Error editing reward in main.js:', error);
    return { success: false, error: error.message };
  }
});


ipcMain.handle('delete-reward', async (event, id) => {
  try {
    await deleteRewardFromFirestore(id); // Call Firebase delete function
    return { success: true };
  } catch (error) {
    console.error('Error deleting reward:', error);
    return { success: false, error };
  }
});

ipcMain.handle('upload-pet-bottle-image', async (event, { fileContent, fileName }) => {
  try {
    const imageUrl = await uploadPetBottleImage(Buffer.from(fileContent), fileName);
    return { success: true, imageUrl };
  } catch (error) {
    console.error('Error uploading pet bottle image:', error);
    return { error: 'Failed to upload pet bottle image' };
  }
});

ipcMain.handle('add-pet-bottle', async (event, petBottle) => {
  try {
    await addPetBottleToFirestore(petBottle);
    return { success: true };
  } catch (error) {
    console.error('Error adding pet bottle:', error);
    return { error: 'Failed to add pet bottle' };
  }
});

ipcMain.handle('get-pet-bottles', async () => {
  try {
    const petBottles = await getPetBottlesFromFirestore();
    return petBottles;
  } catch (error) {
    console.error('Error fetching pet bottles:', error);
    return { error: 'Failed to fetch pet bottles' };
  }
});

ipcMain.handle('edit-pet-bottle', async (event, petBottleId, brandName, size, sizeUnit, weight, weightUnit, barcodeNumber) => {
  try {
    await editPetBottleInFirestore(petBottleId, brandName, size, sizeUnit, weight, weightUnit, barcodeNumber);
    return { success: true };
  } catch (error) {
    console.error('Error editing pet bottle:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-pet-bottle', async (event, id) => {
  try {
    await deletePetBottleFromFirestore(id);
    return { success: true };
  } catch (error) {
    console.error('Error deleting pet bottle:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('add-claimed-reward', async (event, reward) => {
  try {
    await addClaimedReward(reward);
    return { success: true };
  } catch (error) {
    console.error('Error adding claimed reward:', error);
    return { error: 'Failed to add claimed reward' };
  }
});

ipcMain.handle('get-claimed-rewards', async () => {
  try {
    const claimedRewards = await getClaimedRewards();
    return claimedRewards;
  } catch (error) {
    console.error('Error fetching claimed rewards:', error);
    return { error: 'Failed to fetch claimed rewards' };
  }
});

ipcMain.handle('update-claimed-reward-status', async (event, rewardId, status, claimedAt) => {
  try {
    await updateClaimedRewardStatus(rewardId, status, claimedAt);
    return { success: true };
  } catch (error) {
    console.error('Error updating claimed reward status:', error);
    return { error: 'Failed to update claimed reward status' };
  }
});

ipcMain.handle('delete-claimed-reward', async (event, rewardId) => {
  try {
    await deleteClaimedReward(rewardId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting claimed reward:', error);
    return { error: 'Failed to delete claimed reward' };
  }
});

ipcMain.handle('login', async (event, email, password) => {
  try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: { uid: userCredential.user.uid, email: userCredential.user.email } };
  } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message };
  }
});

ipcMain.handle('verify-rfid', async (event, rfidCode) => {
    try {
        const isValid = await verifyRFID(rfidCode);
        return { success: isValid };
    } catch (error) {
        console.error('Error verifying RFID code:', error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('store-user-points', async (event, user) => {
    try {
        await addUserPointToFirestore(user);
        return { success: true };
    } catch (error) {
        console.error('Error storing user points:', error);
        return { success: false, error: error.message };
    }
});


ipcMain.handle('get-UserPoints', async () => {
  try {
    const data = await getUserPointsFromFirestore();
    return data;
  } catch (error) {
    console.error('Error fetching Firestore data:', error);
    return { error: 'Failed to fetch data' };
  }
});