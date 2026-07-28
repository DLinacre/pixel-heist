import { useEffect } from 'react';
import Phaser from 'phaser';

/**
 * Clean lifecycle hook for mounting and destroying a Phaser 3 Game instance without memory leaks.
 */
export function usePhaserGameCleanup(
  config: Phaser.Types.Core.GameConfig,
  containerId: string
) {
  useEffect(() => {
    const game = new Phaser.Game({
      ...config,
      parent: containerId,
    });

    return () => {
      game.destroy(true);
    };
  }, [config, containerId]);
}
