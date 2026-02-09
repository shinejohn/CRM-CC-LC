// Main App
export { CommandCenterApp } from './CommandCenterApp';
export { AppRouter } from './AppRouter';
export { AppProviders } from './AppProviders';

// Core exports
export { ThemeProvider, useTheme, COLOR_PALETTES } from './core/ThemeProvider';
export type { ColorScheme } from './core/ThemeProvider';
export { AppShell } from './core/AppShell';
export { AuthProvider, useAuth } from './core/AuthContext';
export { AuthGuard } from './core/AuthGuard';
export { LayoutProvider, useLayout } from './core/LayoutContext';

// Component exports
export { DarkModeToggle } from './components/ui/DarkModeToggle';
export { ColorPicker } from './components/ui/ColorPicker';
export { ApiErrorDisplay } from './components/errors/ApiErrorDisplay';
export { AIChat } from './components/ai/AIChat';

// Service exports
export { apiService } from './services/api.service';
export type { ApiResponse, ApiError, RequestConfig, PaginationParams } from './services/api.types';
export { eventBus, Events } from './services/events.service';
export { aiService } from './services/ai.service';
export type {
  AIMessage,
  AIPersonality,
  ChatContext,
  GenerationRequest,
  GenerationResponse,
  StreamingChunk,
  ToolCall,
  Citation,
} from './services/ai.types';

// Hook exports
export { useColorScheme } from './hooks/useColorScheme';
export { useApi, useApiGet, useApiMutation } from './hooks/useApi';
export { useWebSocket } from './hooks/useWebSocket';
export { useChannel } from './hooks/useChannel';
export { useDashboard } from './hooks/useDashboard';
export { useCrossModule } from './hooks/useCrossModule';
export { useActivities } from './hooks/useActivities';

// Module exports
export * from './modules/activities';
export * from './modules/ai-hub';
export { useEvent, useEmit, useEventOnce } from './hooks/useEvent';
export { useAI } from './hooks/useAI';

// Store exports
export { useAIStore } from './stores/aiStore';

// Config exports
export { mainNavigation, secondaryNavigation } from './config/navigation';
export { initializeEventBridge } from './config/events';
