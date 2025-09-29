import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ModalConfig {
  title: string;
  icon: string;
  type: 'workspace' | 'board';
}

export interface CreateItemData {
  name: string;
  description: string;
  theme: string;
  color: string;
  icon: string;
  members: string[];
  newMemberEmail: string;
}

export interface ThemeOption {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface IconCategory {
  category: string;
  icons: string[];
}

@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Modal -->
    <div [id]="'create-' + config.type + '-modal'" 
         class="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-black/50 backdrop-blur-sm transition-all duration-300"
         [class.hidden]="!isModalOpen"
         [class.opacity-0]="!isModalOpen"
         [class.opacity-100]="isModalOpen">
      <div class="relative p-4 w-full max-w-2xl mx-auto min-h-screen flex items-center justify-center">
        <!-- Modal content -->
        <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl transform transition-all duration-500 modal-content"
             [class.scale-0]="!isModalOpen"
             [class.scale-100]="isModalOpen"
             [class.rotate-180]="!isModalOpen"
             [class.rotate-0]="isModalOpen">
          <!-- Modal header -->
          <div class="flex items-center justify-between p-6 bg-gradient-to-r from-[#0075A2] to-[#6A4C93] rounded-t-2xl">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center animate-pulse">
                <i [class]="'fas ' + config.icon + ' text-white text-lg'"></i>
              </div>
              <h3 class="text-xl font-bold text-white">
                {{ config.title }}
              </h3>
            </div>
            <button type="button" 
                    (click)="closeModal()"
                    class="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200 hover:scale-110">
              <i class="fas fa-times text-lg"></i>
            </button>
          </div>
          
          <!-- Modal body -->
          <div class="p-6 space-y-6">
            <!-- Item Name -->
            <div class="animate-slide-in" style="animation-delay: 0.1s;">
              <label [for]="config.type + '-name'" class="block mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                <i class="fas fa-edit mr-2 text-[#0075A2]"></i>Nombre del {{ config.type === 'workspace' ? 'Workspace' : 'Board' }}
              </label>
              <input [id]="config.type + '-name'" 
                     type="text" 
                     [(ngModel)]="itemData.name"
                     [placeholder]="'Ingresa el nombre de tu ' + (config.type === 'workspace' ? 'workspace' : 'board')"
                     class="w-full bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-[#0075A2] focus:border-[#0075A2] p-2.5 transition-all duration-200 hover:shadow-md">
            </div>

            <!-- Item Description -->
            <div class="animate-slide-in" style="animation-delay: 0.2s;">
              <label [for]="config.type + '-description'" class="block mb-2 text-sm font-bold text-gray-900 dark:text-gray-100">
                <i class="fas fa-align-left mr-2 text-[#0075A2]"></i>Descripción
              </label>
              <textarea [id]="config.type + '-description'" 
                        [(ngModel)]="itemData.description"
                        rows="3"
                        [placeholder]="'Describe brevemente tu ' + (config.type === 'workspace' ? 'workspace' : 'board')"
                        class="w-full bg-gray-50 border border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-gray-900 text-sm rounded-lg focus:ring-[#0075A2] focus:border-[#0075A2] p-2.5 transition-all duration-200 hover:shadow-md resize-none"></textarea>
            </div>
            
            <!-- Theme Selection -->
            <div class="animate-slide-in" style="animation-delay: 0.3s;">
              <label class="block mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">
                <i class="fas fa-palette mr-2 text-[#0075A2]"></i>Tema Predefinido
              </label>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div *ngFor="let theme of availableThemes; let i = index" 
                     class="theme-option cursor-pointer p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 hover:shadow-lg animate-fade-in"
                     [style.animation-delay]="(0.4 + i * 0.05) + 's'"
                     [class.selected]="itemData.theme === theme.id"
                     [class.border-blue-500]="itemData.theme === theme.id"
                     [class.border-white]="itemData.theme !== theme.id"
                     (click)="selectTheme(theme.id)">
                  <div class="flex flex-col items-center gap-2">
                    <div class="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-all duration-200"
                         [style.background]="theme.color">
                      <i [class]="theme.icon" class="text-white text-sm"></i>
                    </div>
                    <span class="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">{{ theme.name }}</span>
                  </div>
                </div>
              </div>

              <!-- Color Personalizado -->
              <div class="flex items-center gap-4 mb-4">
                <div class="flex items-center gap-2">
                  <label class="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</label>
                  <div class="flex gap-2">
                    <button *ngFor="let color of colorPresets"
                            type="button"
                            class="w-8 h-8 rounded-lg border-2 border-white shadow-md hover:scale-110 transition-all duration-200"
                            [style.background]="color"
                            (click)="selectColor(color)"></button>
                  </div>
                </div>
                <input type="color" 
                       [(ngModel)]="itemData.color"
                       class="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer hover:scale-110 transition-all duration-200">
              </div>
            </div>

            <!-- Icon Selection -->
            <div class="animate-slide-in" style="animation-delay: 0.4s;">
              <label class="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Icono</label>
              <div class="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
                <div *ngFor="let category of availableIcons" class="mb-4">
                  <h5 class="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">{{ category.category }}</h5>
                  <div class="grid grid-cols-6 md:grid-cols-8 gap-2">
                    <button *ngFor="let icon of category.icons"
                            type="button"
                            class="w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 text-white"
                            [class.border-white]="getCurrentIcon() !== icon"
                            [class.border-blue-500]="getCurrentIcon() === icon"
                            [class.bg-blue-50]="getCurrentIcon() === icon"
                            (click)="selectIcon(icon)">
                      <i [class]="icon" class="text-sm"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div class="bg-gray-50 rounded-lg p-4 border">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Vista Previa</label>
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg"
                     [style.background]="getCurrentColor()">
                  <i [class]="getCurrentIcon()" class="text-white text-lg"></i>
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 dark:text-white">{{ itemData.name || ('Nuevo ' + (config.type === 'workspace' ? 'Workspace' : 'Board')) }}</h4>
                  <p class="text-sm text-gray-600 dark:text-gray-400">{{ itemData.description || 'Sin descripción' }}</p>
                </div>
              </div>
            </div>

            <!-- Members Section -->
            <div class="animate-slide-in" style="animation-delay: 0.5s;">
              <label class="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                <i class="fas fa-users mr-2 text-[#0075A2]"></i>Miembros del {{ config.type === 'workspace' ? 'Workspace' : 'Board' }}
              </label>
              <div class="flex flex-wrap gap-2 mb-3">
                <span *ngFor="let member of itemData.members; let i = index"
                      class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#0075A2] text-white animate-bounce-in">
                  {{ member }}
                  <button type="button" 
                          (click)="removeMember(i)"
                          class="ml-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-xs">
                    ×
                  </button>
                </span>
              </div>
              <div class="flex gap-2">
                <input type="email" 
                       [(ngModel)]="itemData.newMemberEmail"
                       placeholder="Email del miembro"
                       class="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-[#0075A2] focus:border-[#0075A2] p-2.5 transition-all duration-200 hover:shadow-md">
                <button type="button" 
                        (click)="addMember()"
                        class="px-4 py-2 bg-[#0075A2] text-white rounded-lg hover:bg-[#005f85] transition-all duration-200 font-medium">
                  Agregar
                </button>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-b-2xl">
            <button type="button" 
                    (click)="closeModal()"
                    class="px-6 py-2.5 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-900 focus:z-10 focus:ring-2 focus:ring-gray-200 transition-all duration-200">
              Cancelar
            </button>
            <button type="button" 
                    (click)="createItem()"
                    [disabled]="!itemData.name.trim()"
                    class="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#0075A2] to-[#6A4C93] rounded-lg hover:from-[#005f85] hover:to-[#573080] focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">
              <i class="fas fa-plus mr-2"></i>
              Crear {{ config.type === 'workspace' ? 'Workspace' : 'Board' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './create-modal.component.css'
})
export class CreateModalComponent implements OnInit, OnChanges {
  @Input() isModalOpen = false;
  @Input() config: ModalConfig = { title: '', icon: '', type: 'workspace' };
  @Input() availableThemes: ThemeOption[] = [];
  @Input() availableIcons: IconCategory[] = [];
  @Input() colorPresets: string[] = [];

  @Output() modalClosed = new EventEmitter<void>();
  @Output() itemCreated = new EventEmitter<CreateItemData>();

  itemData: CreateItemData = {
    name: '',
    description: '',
    theme: '',
    color: '#0075A2',
    icon: 'fa-briefcase',
    members: [],
    newMemberEmail: ''
  };

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Reset scroll position when modal opens
    if (this.isModalOpen) {
      setTimeout(() => {
        const modalElement = document.querySelector(`#create-${this.config.type}-modal`);
        if (modalElement) {
          modalElement.scrollTop = 0;
        }
        this.cdr.detectChanges();
      }, 10);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Reset scroll when isModalOpen changes to true
    if (changes['isModalOpen'] && changes['isModalOpen'].currentValue === true) {
      setTimeout(() => {
        const modalElement = document.querySelector(`#create-${this.config.type}-modal`);
        if (modalElement) {
          modalElement.scrollTop = 0;
        }
      }, 50);
    }
  }

  closeModal(): void {
    this.modalClosed.emit();
  }

  selectTheme(themeId: string): void {
    const theme = this.availableThemes.find(t => t.id === themeId);
    if (theme) {
      this.itemData.theme = themeId;
      this.itemData.color = theme.color;
      this.itemData.icon = theme.icon;
    }
  }

  selectColor(color: string): void {
    this.itemData.color = color;
    this.itemData.theme = 'personalizado';
  }

  selectIcon(icon: string): void {
    this.itemData.icon = icon;
    this.itemData.theme = 'personalizado';
  }

  getCurrentColor(): string {
    return this.itemData.color || '#0075A2';
  }

  getCurrentIcon(): string {
    return this.itemData.icon || 'fa-briefcase';
  }

  addMember(): void {
    const email = this.itemData.newMemberEmail.trim();
    if (email && email.includes('@') && !this.itemData.members.includes(email)) {
      this.itemData.members.push(email);
      this.itemData.newMemberEmail = '';
    }
  }

  removeMember(index: number): void {
    this.itemData.members.splice(index, 1);
  }

  createItem(): void {
    if (this.itemData.name.trim()) {
      this.itemCreated.emit({ ...this.itemData });
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.itemData = {
      name: '',
      description: '',
      theme: '',
      color: '#0075A2',
      icon: 'fa-briefcase',
      members: [],
      newMemberEmail: ''
    };
  }
}