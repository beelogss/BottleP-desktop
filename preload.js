const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getUserCount: () => ipcRenderer.invoke('get-user-count'),
  getClaimedRewardsCount: () => ipcRenderer.invoke('get-claimed-rewards-count'),
  getTotalBottleCount: () => ipcRenderer.invoke('getTotalBottleCount'),
  getTotalBottleWeight: () => ipcRenderer.invoke('getTotalBottleWeight'),
  

  getData: () => ipcRenderer.invoke('get-data'),
  editUser: (userId, studentNumber, name, email) => ipcRenderer.invoke('edit-user', userId, studentNumber, name, email),
  deleteUser: (userId) => ipcRenderer.invoke('delete-user', userId),

  uploadImage: (file) => ipcRenderer.invoke('upload-image', file),
  addReward: (reward) => ipcRenderer.invoke('add-reward', reward),
  getRewards: () => ipcRenderer.invoke('get-rewards'),
  editReward: (rewardId, rewardName, stock, points) => ipcRenderer.invoke('edit-reward', rewardId, rewardName, stock, points),
  deleteReward: (rewardId) => ipcRenderer.invoke('delete-reward', rewardId),

  uploadPetBottleImage: (file) => ipcRenderer.invoke('upload-pet-bottle-image', file),
  addPetBottle: (petBottle) => ipcRenderer.invoke('add-pet-bottle', petBottle),
  getPetBottles: () => ipcRenderer.invoke('get-pet-bottles'),
  editPetBottle: (petBottleId, brandName, size, sizeUnit, weight, weightUnit, barcodeNumber, imageUrl) => ipcRenderer.invoke('edit-pet-bottle', petBottleId, brandName, size, sizeUnit, weight, weightUnit, barcodeNumber, imageUrl),
  deletePetBottle: (petBottleId) => ipcRenderer.invoke('delete-pet-bottle', petBottleId),

  addClaimedReward: (reward) => ipcRenderer.invoke('add-claimed-reward', reward),
  getClaimedRewards: () => ipcRenderer.invoke('get-claimed-rewards'),
  updateClaimedRewardStatus: (rewardId, status, claimedAt) => ipcRenderer.invoke('update-claimed-reward-status', rewardId, status, claimedAt),
  deleteClaimedReward: (rewardId) => ipcRenderer.invoke('delete-claimed-reward', rewardId),

  login: (email, password) => ipcRenderer.invoke('login', email, password),
  verifyRFID: (rfidCode) => ipcRenderer.invoke('verify-rfid', rfidCode),

  storeUserPoints: (user) => ipcRenderer.invoke('store-user-points', user),
  getUserPoints: () => ipcRenderer.invoke('get-UserPoints'),
  onBottleDetected: (callback) => ipcRenderer.on('bottle-detected', callback),

  updateClaimedRewardAvailability: (rewardId, availability) => 
      ipcRenderer.invoke('update-claimed-reward-availability', rewardId, availability),

  getReports: () => ipcRenderer.invoke('get-reports'),
  updateReport: (reportId, status, adminResponse) => 
      ipcRenderer.invoke('update-report', reportId, status, adminResponse),
});
