import backgroundVideo from '../assets/mainbackgroundvideo/main.mp4';
import logo from '../assets/logo/logo.png';
import { RESOURCE_PRIORITIES } from './loadingManager';

// Get all team member images from the Team component
import Hemanth from '../assets/our_team/Hemanth.png';
import Yashasri from '../assets/our_team/Yashasri.png';
import Chandhan from '../assets/our_team/Chandhan.png';
import Thanuja from '../assets/our_team/Thanuja.png';
import Bhuvana from '../assets/our_team/Bhuvana.png';
import Manish from '../assets/our_team/Manish.png';
import Nithin from '../assets/our_team/Nithin.png';

// Background placeholder
import placeholderImage from '../assets/mainbackgroundvideo/placeholder.jpg';

// Registry of all critical assets that need to be preloaded
export const CriticalAssets = {
  // Critical/High priority assets (preloaded first)
  CRITICAL: [
    { type: 'image', src: logo, id: 'logo_main', description: 'Main logo' },
    { type: 'image', src: placeholderImage, id: 'hero_placeholder', description: 'Hero background placeholder' },
  ],
  
  // High priority (visible above the fold)
  HIGH: [
    { type: 'video', src: backgroundVideo, id: 'hero_video', description: 'Background hero video' },
    { type: 'image', src: Hemanth, id: 'team_hemanth', description: 'Team member - Hemanth' },
    { type: 'image', src: Yashasri, id: 'team_yashasri', description: 'Team member - Yashasri' },
  ],
  
  // Medium priority (visible when scrolling down)
  MEDIUM: [
    { type: 'image', src: Chandhan, id: 'team_chandhan', description: 'Team member - Chandhan' },
    { type: 'image', src: Thanuja, id: 'team_thanuja', description: 'Team member - Thanuja' },
    { type: 'image', src: Bhuvana, id: 'team_bhuvana', description: 'Team member - Bhuvana' },
    { type: 'image', src: Manish, id: 'team_manish', description: 'Team member - Manish' },
    { type: 'image', src: Nithin, id: 'team_nithin', description: 'Team member - Nithin' },
  ],
};

// Function to preload all critical assets
export const preloadCriticalAssets = async (loadingManager) => {
  const { preloadImage, preloadVideo, RESOURCE_PRIORITIES } = loadingManager;
  
  // First preload all critical assets
  const criticalPromises = CriticalAssets.CRITICAL.map(asset => {
    if (asset.type === 'image') {
      return preloadImage(asset.src, asset.id, RESOURCE_PRIORITIES.CRITICAL);
    } else if (asset.type === 'video') {
      return preloadVideo(asset.src, asset.id, RESOURCE_PRIORITIES.CRITICAL);
    }
    return Promise.resolve();
  });
  
  // Then preload high priority assets
  const highPromises = CriticalAssets.HIGH.map(asset => {
    if (asset.type === 'image') {
      return preloadImage(asset.src, asset.id, RESOURCE_PRIORITIES.HIGH);
    } else if (asset.type === 'video') {
      return preloadVideo(asset.src, asset.id, RESOURCE_PRIORITIES.HIGH);
    }
    return Promise.resolve();
  });
  
  // Start preloading medium priority assets in background
  CriticalAssets.MEDIUM.forEach(asset => {
    if (asset.type === 'image') {
      preloadImage(asset.src, asset.id, RESOURCE_PRIORITIES.MEDIUM);
    } else if (asset.type === 'video') {
      preloadVideo(asset.src, asset.id, RESOURCE_PRIORITIES.MEDIUM);
    }
  });
  
  // Wait for critical assets first
  await Promise.allSettled(criticalPromises);
  
  // Then continue with high priority assets
  await Promise.allSettled(highPromises);
  
  // Medium priority assets are already loading in the background
  return true;
};

// Function to preload fonts
export const preloadFonts = (loadingManager) => {
  const { registerResource, resourceLoaded } = loadingManager;
  
  // Register all required fonts
  const fonts = [
    { family: 'Inter', weights: [400, 500, 600, 700], id: 'font_inter' },
  ];
  
  fonts.forEach(font => {
    registerResource(font.id, RESOURCE_PRIORITIES.HIGH);
    
    // Use Font Loading API if available
    if ('fonts' in document) {
      Promise.all(
        font.weights.map(weight => 
          document.fonts.load(`${weight} 1em ${font.family}`)
        )
      ).then(() => {
        resourceLoaded(font.id);
      }).catch(() => {
        // Mark as loaded anyway to not block the app
        resourceLoaded(font.id);
      });
    } else {
      // Fallback for browsers that don't support Font Loading API
      // Just mark as loaded after a short timeout
      setTimeout(() => resourceLoaded(font.id), 500);
    }
  });
};

// Function to register all portfolio items
export const registerPortfolioItems = (items, loadingManager) => {
  const { registerResource } = loadingManager;
  
  if (!items || !items.length) return;
  
  // Register all portfolio items, but don't preload them immediately
  // They will be loaded on demand when the user scrolls to them
  items.forEach((item, index) => {
    if (item.thumbnailUrl) {
      registerResource(`portfolio_thumb_${index}`, RESOURCE_PRIORITIES.LOW);
    }
    
    if (item.videoUrl) {
      registerResource(`portfolio_video_${index}`, RESOURCE_PRIORITIES.LOW);
    }
  });
};

// Main function to initialize all asset loading
export const initializeAssetLoading = async (loadingManager) => {
  // Start preloading critical resources
  preloadFonts(loadingManager);
  
  // Then preload all visual assets
  await preloadCriticalAssets(loadingManager);
  
  return true;
}; 