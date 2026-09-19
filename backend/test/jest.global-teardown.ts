export default async () => {
  if (globalThis.mySQLContainer) {
    console.log('🛑 Stopping MySQL container...');
    try {
      await globalThis.mySQLContainer.stop();
      console.log('✅ MySQL container stopped');
    } catch (error) {
      console.error('⚠️ Error stopping MySQL container:', error);
    }
  }
};
