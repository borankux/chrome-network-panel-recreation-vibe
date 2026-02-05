import { useEffect } from 'react';
import { NetworkPanel } from '@/components/network-panel/NetworkPanel';
import { useNetworkStore } from '@/stores/networkStore';
import { generateMockData } from '@/hooks/useHARImport';

function App() {
  const setEntries = useNetworkStore((state) => state.setEntries);

  useEffect(() => {
    const hasData = useNetworkStore.getState().entries.length > 0;
    if (!hasData) {
      const mockData = generateMockData(50);
      setEntries(mockData);
    }
  }, [setEntries]);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <NetworkPanel />
    </div>
  );
}

export default App;
