// src/bot/utils/navigation.ts

export class NavigationManager {
  constructor() {
    this.menuHierarchy = {
      'main': null,
      'analyses': 'main',
      'platforms': 'main',
      'report': 'main',
      'points': 'main',
      'history': 'main',
      'ranking': 'main',
      'analysis_individual': 'analyses',
      'analysis_group': 'analyses',
      'report_platform': 'report',
      'report_provider': 'report_platform',
      'report_game': 'report_provider',
      'ranking_position': 'ranking'
    };
  }

  pushToStack(session: any, currentMenu: string): void {
    if (!session.navigationStack) {
      session.navigationStack = [];
    }
    session.navigationStack.push(currentMenu);
  }

  popFromStack(session: any): string {
    if (!session.navigationStack || session.navigationStack.length === 0) {
      return 'main';
    }
    return session.navigationStack.pop();
  }

  getParentMenu(currentMenu: string): string {
    return this.menuHierarchy[currentMenu] || 'main';
  }

  clearStack(session: any): void {
    session.navigationStack = [];
  }

  getCurrentPath(session: any): string {
    return session.navigationStack?.join(' > ') || 'main';
  }

  private menuHierarchy: { [key: string]: string | null };
}

export const navigationManager = new NavigationManager();