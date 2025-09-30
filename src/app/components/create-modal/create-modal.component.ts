import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectorRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
    <!-- Compact Modal Container -->
    <div #modalContainer 
         [id]="'create-' + config.type + '-modal'" 
         class="fixed inset-0 z-50 overflow-hidden transition-all duration-300"
         [class.pointer-events-none]="!isModalOpen"
         [class.pointer-events-auto]="isModalOpen"
         [class.opacity-0]="!isModalOpen"
         [class.opacity-100]="isModalOpen">
      
      <!-- Enhanced Backdrop -->
      <div class="absolute inset-0 bg-gradient-to-br from-black/40 via-black/60 to-black/80 backdrop-blur-xl transition-all duration-500"
           [class.opacity-0]="!isModalOpen"
           [class.opacity-100]="isModalOpen">
        <!-- Animated Background Particles -->
        <div class="absolute inset-0 overflow-hidden">
          <div class="floating-element absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-[#0075A2]/20 to-[#4B9BE8]/20 rounded-full blur-3xl animate-pulse"></div>
          <div class="floating-element absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-[#6A4C93]/20 to-[#FF6B6B]/20 rounded-full blur-2xl animate-pulse" style="animation-delay: 1s;"></div>
        </div>
      </div>

      <!-- Modal Wrapper with Preview Layout -->
      <div class="relative p-8 w-full max-w-8xl mx-auto h-screen flex items-center justify-center">
        <div class="flex gap-12 w-full items-center justify-center">
        


        <!-- Main Modal Content -->
        <!-- Progress Indicator Floating Above Modal -->
        <div class="absolute -top-6 left-1/2 transform -translate-x-1/2 z-30 transition-all duration-500"
             [class.opacity-0]="!isModalOpen"
             [class.opacity-100]="isModalOpen"
             [class.scale-95]="!isModalOpen"
             [class.scale-100]="isModalOpen">
          <div class="rounded-full px-4 py-1.5 bg-black/80 backdrop-blur-sm border border-black/40 shadow-xl">
            <div class="flex items-center space-x-3">
              <span class="text-white text-xs font-medium">
                Paso <span class="progress-number">{{ currentStep + 1 }}</span> de {{ totalSteps }}
              </span>
              <div class="w-16 h-1 bg-gray-700 rounded-full overflow-hidden progress-container">
                <div class="progress-bar h-full bg-white rounded-full transition-all duration-800"
                     [style.width]="(currentStep / (totalSteps - 1)) * 100 + '%'"></div>
              </div>
            </div>
          </div>
        </div>

        <div #modalContent 
             class="relative w-full max-w-3xl max-h-[90vh] modal-content bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-700 flex flex-col"
             [class.scale-95]="!isModalOpen"
             [class.scale-100]="isModalOpen"
             [class.translate-y-4]="!isModalOpen"
             [class.translate-y-0]="isModalOpen"
             [class.opacity-0]="!isModalOpen"
             [class.opacity-100]="isModalOpen"
             style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);">
             
          <!-- Modal Header -->
          <div #modalHeader class="relative p-6 bg-[#0075A2] rounded-t-2xl overflow-hidden modal-header flex-shrink-0">
            <!-- Dynamic Background Effects -->
            <div class="absolute inset-0">
              <div class="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div class="floating-element absolute -top-5 -right-5 w-16 h-16 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
            </div>
            

            
            <!-- Header Content -->
            <div class="relative flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Enhanced Icon Container -->
                <div class="relative group">
                  <div class="w-10 h-10 glass-effect bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl border border-white/30 group-hover:scale-110 transition-all duration-300">
                    <i [class]="'fas ' + config.icon + ' text-white text-lg group-hover:rotate-12 transition-transform duration-300'"></i>
                  </div>
                </div>
                
                <!-- Title Section -->
                <div class="space-y-0">
                  <h3 class="text-xl font-bold text-white tracking-tight">
                    {{ config.title }}
                  </h3>
                  <p class="text-white/80 text-xs">{{ config.type === 'workspace' ? 'Organiza tu flujo de trabajo' : 'Gestiona tus tareas' }}</p>
                </div>
              </div>
              
              <!-- Enhanced Close Button -->
              <button type="button" 
                      (click)="closeModal()"
                      class="relative group p-2 rounded-lg glass-effect bg-white/10 backdrop-blur-sm border border-white/20 text-white/70 hover:text-white hover:bg-white/20 hover:scale-110 active:scale-95 transition-all duration-300">
                <i class="fas fa-times text-lg transition-all duration-300 group-hover:rotate-90"></i>
              </button>
            </div>
          </div>
          

          
          <!-- Scrollable Modal Body -->
          <div class="p-6 space-y-6 bg-white dark:bg-gray-900 relative overflow-y-auto flex-1 modal-scroll">
            
            <!-- Name Input -->
            <div class="group relative">
              <label [for]="config.type + '-name'" class="block mb-3 text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                  <i class="fas fa-edit text-[#0075A2] text-sm"></i>
                </div>
                Nombre del {{ config.type === 'workspace' ? 'Workspace' : 'Board' }}
              </label>
              
              <div class="relative">
                <input [id]="config.type + '-name'" 
                       type="text" 
                       [(ngModel)]="itemData.name"
                       (input)="updateProgress()"
                       [placeholder]="'Ej: ' + (config.type === 'workspace' ? 'Mi Workspace' : 'Proyecto Q1')"
                       class="w-full h-12 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 dark:text-white text-gray-900 text-base rounded-lg focus:ring-2 focus:ring-[#0075A2] focus:border-[#0075A2] px-4 pr-12 transition-all duration-300 placeholder:text-gray-400">
                
                <div class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <i class="fas fa-{{ config.type === 'workspace' ? 'briefcase' : 'clipboard-list' }} text-sm"></i>
                </div>
                
                <div class="absolute bottom-0 right-3 text-xs text-gray-400">
                  {{ itemData.name.length }}/50
                </div>
              </div>
            </div>

            <!-- Description Input -->
            <div class="group relative">
              <label [for]="config.type + '-description'" class="block mb-3 text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                  <i class="fas fa-align-left text-[#4B9BE8] text-sm"></i>
                </div>
                Descripción
              </label>
              
              <div class="relative">
                <textarea [id]="config.type + '-description'" 
                          [(ngModel)]="itemData.description"
                          (input)="updateProgress()"
                          rows="3"
                          [placeholder]="'Describe brevemente el propósito...'"
                          class="w-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 dark:text-white text-gray-900 text-base rounded-lg focus:ring-2 focus:ring-[#4B9BE8] focus:border-[#4B9BE8] p-4 pr-12 transition-all duration-300 resize-none placeholder:text-gray-400"></textarea>
                
                <div class="absolute bottom-2 right-3 text-xs text-gray-400">
                  {{ itemData.description.length }}/200
                </div>
              </div>
            </div>

            <!-- Icon Selector -->
            <div class="group">
              <label class="block mb-3 text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                  <i class="fas fa-icons text-[#0075A2] text-sm"></i>
                </div>
                Icono
              </label>
              
              <!-- Current Icon Display & Selector Button -->
              <div class="mb-4">
                <button type="button"
                        (click)="toggleIconSelector()"
                        class="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.01]"
                        [class.border-[#0075A2]]="itemData.icon"
                        [class.bg-blue-50]="itemData.icon"
                        [class.dark:bg-blue-900/20]="itemData.icon"
                        [class.border-gray-300]="!itemData.icon"
                        [class.bg-gray-50]="!itemData.icon"
                        [class.dark:bg-gray-700]="!itemData.icon"
                        [class.dark:border-gray-600]="!itemData.icon">
                  
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300"
                       [style.background]="itemData.icon ? getCurrentColor() : 'transparent'"
                       [class.border-2]="!itemData.icon"
                       [class.border-dashed]="!itemData.icon"
                       [class.border-gray-400]="!itemData.icon">
                    <i [class]="itemData.icon ? 'fas ' + getSelectedIcon() + ' text-white' : 'fas fa-plus text-gray-400'" 
                       class="text-xl"></i>
                  </div>
                  
                  <div class="flex-1 text-left">
                    <h4 class="font-bold text-gray-800 dark:text-gray-200 text-sm">
                      {{ itemData.icon ? (itemData.icon.replace('fa-', '') | titlecase) : 'Seleccionar Icono' }}
                    </h4>
                    <p class="text-gray-500 dark:text-gray-400 text-xs">
                      {{ itemData.icon ? 'Haz clic para cambiar el icono' : 'Elige de más de 120 iconos disponibles' }}
                    </p>
                  </div>
                  
                  <i class="fas fa-chevron-down text-gray-400 transition-transform duration-200"
                     [class.rotate-180]="showIconSelector"></i>
                </button>
              </div>
              
              <!-- Icon Selector Dropdown -->
              <div *ngIf="showIconSelector" 
                   class="bg-white dark:bg-gray-800 border-2 border-[#0075A2] rounded-xl shadow-xl overflow-hidden transition-all duration-300 animate-in slide-in-from-top-5">
                
                <!-- Header -->
                <div class="px-4 py-3 bg-gradient-to-r from-[#0075A2] to-[#4B9BE8] text-white flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-icons text-lg"></i>
                    <span class="font-semibold text-sm">Seleccionar Icono</span>
                  </div>
                  <button (click)="toggleIconSelector()" 
                          class="w-6 h-6 rounded-md bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
                    <i class="fas fa-times text-xs"></i>
                  </button>
                </div>
                
                <!-- Category Pills -->
                <div class="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex flex-wrap gap-2">
                    <button *ngFor="let category of iconCategories"
                            (click)="selectIconCategory(category.category)"
                            class="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 capitalize flex items-center gap-1.5"
                            [class.bg-[#0075A2]]="selectedIconCategory === category.category"
                            [class.text-white]="selectedIconCategory === category.category"
                            [class.shadow-md]="selectedIconCategory === category.category"
                            [class.bg-white]="selectedIconCategory !== category.category"
                            [class.text-gray-700]="selectedIconCategory !== category.category"
                            [class.dark:bg-gray-700]="selectedIconCategory !== category.category"
                            [class.dark:text-gray-300]="selectedIconCategory !== category.category"
                            [class.hover:bg-gray-100]="selectedIconCategory !== category.category"
                            [class.dark:hover:bg-gray-600]="selectedIconCategory !== category.category">
                      <i [class]="getCategoryIcon(category.category)" class="text-xs"></i>
                      {{ category.category }}
                      <span class="opacity-75">({{ category.icons.length }})</span>
                    </button>
                  </div>
                </div>
                
                <!-- Icon Grid -->
                <div class="p-4 max-h-80 overflow-y-auto">
                  <div class="mb-3">
                    <h6 class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">{{ selectedIconCategory }} - {{ getSelectedCategoryIcons().length }} iconos</h6>
                  </div>
                  
                  <div class="grid grid-cols-8 gap-3">
                    <button *ngFor="let icon of getSelectedCategoryIcons()"
                            (click)="selectIcon(icon)"
                            class="aspect-square rounded-lg border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 relative group"
                            [class.border-[#0075A2]]="itemData.icon === icon"
                            [class.bg-blue-50]="itemData.icon === icon"
                            [class.shadow-md]="itemData.icon === icon"
                            [class.border-gray-200]="itemData.icon !== icon"
                            [class.dark:border-gray-600]="itemData.icon !== icon"
                            [class.bg-gray-50]="itemData.icon !== icon"
                            [class.dark:bg-gray-700]="itemData.icon !== icon"
                            [class.hover:border-[#0075A2]]="itemData.icon !== icon"
                            [class.hover:bg-blue-50]="itemData.icon !== icon"
                            [class.dark:hover:bg-gray-600]="itemData.icon !== icon">
                      
                      <!-- Selection indicator -->
                      <div *ngIf="itemData.icon === icon" 
                           class="absolute -top-1 -right-1 w-4 h-4 bg-[#0075A2] rounded-full flex items-center justify-center">
                        <i class="fas fa-check text-white text-xs"></i>
                      </div>
                      
                      <i [class]="'fas ' + icon" 
                         [class.text-[#0075A2]]="itemData.icon === icon"
                         [class.text-gray-600]="itemData.icon !== icon"
                         [class.dark:text-gray-300]="itemData.icon !== icon"
                         [class.group-hover:text-[#0075A2]]="itemData.icon !== icon"
                         class="text-base transition-colors duration-200"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Footer with quick actions -->
                <div class="px-4 py-3 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex items-center justify-between">
                    <div class="text-xs text-gray-600 dark:text-gray-400">
                      <span *ngIf="itemData.icon">{{ itemData.icon.replace('fa-', '') | titlecase }}</span>
                      <span *ngIf="!itemData.icon">Selecciona un icono</span>
                    </div>
                    <button (click)="toggleIconSelector()" 
                            class="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Color Selector -->
            <div class="group">
              <label class="block mb-3 text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center">
                <div class="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                  <i class="fas fa-palette text-[#0075A2] text-sm"></i>
                </div>
                Color
              </label>
              <div class="flex items-center gap-3">
                <div class="flex gap-2">
                  <button *ngFor="let color of colorPresets"
                          type="button"
                          class="w-8 h-8 rounded-lg border-2 shadow-md hover:scale-110 transition-all duration-300"
                          [style.background]="color"
                          [class.border-gray-800]="itemData.color === color"
                          [class.border-white]="itemData.color !== color"
                          [class.ring-2]="itemData.color === color"
                          [class.ring-gray-800]="itemData.color === color"
                          [class.ring-offset-2]="itemData.color === color"
                          (click)="selectColor(color)"></button>
                </div>
                <input type="color" 
                       [(ngModel)]="itemData.color"
                       class="w-10 h-8 rounded-lg border-2 border-gray-200 cursor-pointer">
              </div>
            </div>


          </div>

          <!-- Modal Footer -->
          <div class="relative p-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-b-2xl flex-shrink-0">
            <div class="flex items-center justify-between gap-4">
              <!-- Progress Info -->
              <div class="flex-1 progress-wrapper">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Progreso</span>
                  <span class="text-sm font-bold text-[#0075A2] progress-number">{{ getProgressPercentage() }}%</span>
                </div>
                <div class="w-full h-2 bg-gray-200/60 dark:bg-gray-700/60 rounded-full overflow-hidden progress-container">
                  <div class="progress-bar h-full bg-gradient-to-r from-[#0075A2] via-[#4B9BE8] to-[#6A4C93] rounded-full"
                       [style.width]="getProgressPercentage() + '%'"></div>
                </div>
              </div>
              
              <!-- Action Buttons -->
              <div class="flex items-center gap-3">
                <button type="button" 
                        (click)="closeModal()"
                        class="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-300">
                  Cancelar
                </button>
                
                <button type="button" 
                        (click)="createItem()"
                        [disabled]="!itemData.name.trim()"
                        class="create-button px-8 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-[#0075A2] via-[#4B9BE8] to-[#0075A2] rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group flex items-center gap-2">
                  <i class="fas fa-plus relative z-10 transition-transform duration-300 group-hover:rotate-90" 
                     [class.fa-plus]="!isCreating" 
                     [class.fa-check]="isCreating"></i>
                  <span class="relative z-10">{{ !isCreating ? 'Crear' : '¡Creado!' }}</span>
                  <div class="absolute inset-0 bg-gradient-to-r from-[#4B9BE8] via-[#0075A2] to-[#003f5c] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div class="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview Card (Board/Workspace) -->
        <div class="w-full max-w-md transform transition-all duration-700 flex items-center justify-center"
             [class.scale-95]="!isModalOpen"
             [class.scale-100]="isModalOpen"
             [class.translate-x-4]="!isModalOpen"
             [class.translate-x-0]="isModalOpen"
             [class.opacity-0]="!isModalOpen"
             [class.opacity-100]="isModalOpen">
          
          <div class="w-full">
            
            <!-- Board Preview (when type = 'board') -->
            <div *ngIf="config.type === 'board'" class="bg-gray-700 rounded-lg shadow-2xl overflow-hidden border border-gray-600 transition-all duration-500 hover:scale-[1.02] w-full">
              
              <!-- Board Header -->
              <div class="px-4 py-3 bg-gray-800 border-b border-gray-600 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-md flex items-center justify-center"
                       [style.background]="getCurrentColor()">
                    <i [class]="'fas ' + getSelectedIcon() + ' text-white text-sm'"></i>
                  </div>
                  <div>
                    <h3 class="text-white font-bold text-base truncate max-w-40">
                      {{ itemData.name || 'Board Desarrollo' }}
                    </h3>
                    <p class="text-gray-300 text-xs">{{ itemData.description || 'Sprint actual en progreso' }}</p>
                  </div>
                </div>
                <button class="text-white px-3 py-1.5 rounded text-xs font-medium transition-all duration-300 hover:opacity-90 hover:scale-105"
                        [style.background]="getCurrentColor()">
                  Ver Board <i class="fas fa-external-link-alt ml-1"></i>
                </button>
              </div>
              
              <!-- Progress Section -->
              <div class="p-4 bg-gray-750">
                <div class="mb-3">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-gray-300 text-sm font-medium">Progreso</span>
                    <span class="text-sm font-bold" [style.color]="getCurrentColor()">{{ getProgressPercentage() }}%</span>
                  </div>
                  <div class="w-full h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-800"
                         [style.background]="'linear-gradient(90deg, ' + getCurrentColor() + ', ' + getCurrentColor() + 'dd)'"
                         [style.width]="getProgressPercentage() + '%'"></div>
                  </div>
                </div>
                
                <!-- Stats -->
                <div class="flex items-center gap-4 text-sm">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span class="text-green-400 font-medium">{{ getCompletedTasks() }} Completadas</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span class="text-orange-400 font-medium">{{ getPendingTasks() }} Pendientes</span>
                  </div>
                  <span class="text-gray-400 ml-auto">Total: 16</span>
                </div>
              </div>
              
              <!-- Team Members -->
              <div class="px-4 py-3 bg-gray-700 border-t border-gray-600" *ngIf="itemData.members.length > 0">
                <div class="flex items-center justify-between">
                  <span class="text-gray-300 text-sm font-medium">Equipo</span>
                  <div class="flex -space-x-1">
                    <div *ngFor="let member of itemData.members.slice(0, 4); let i = index"
                         class="w-7 h-7 rounded-full border-2 border-gray-700 flex items-center justify-center text-white text-xs font-bold transition-transform hover:scale-110"
                         [style.background]="getAvatarColor(member)">
                      {{ getMemberInitials(member) }}
                    </div>
                    <div *ngIf="itemData.members.length > 4"
                         class="w-7 h-7 rounded-full border-2 border-gray-700 bg-gray-600 flex items-center justify-center text-gray-300 text-xs font-bold">
                      +{{ itemData.members.length - 4 }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Workspace Preview (when type = 'workspace') -->
            <div *ngIf="config.type === 'workspace'" class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-600 transition-all duration-500 hover:scale-[1.02] w-full">
              
              <!-- Workspace Header Section -->
              <div class="relative px-5 py-6 text-white transition-all duration-500"
                   [style.background]="'linear-gradient(135deg, ' + getCurrentColor() + ', ' + getCurrentColor() + 'dd)'">
                <!-- Favorite Icon -->
                <div class="absolute top-4 right-4">
                  <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <i class="fas fa-heart text-white text-sm"></i>
                  </div>
                </div>
                
                <!-- Icon -->
                <div class="mb-4">
                  <div class="w-12 h-12 bg-white/25 rounded-lg flex items-center justify-center backdrop-blur-sm transition-all duration-300">
                    <i [class]="'fas ' + getSelectedIcon() + ' text-white text-xl'"></i>
                  </div>
                </div>
                
                <!-- Update Status -->
                <div class="text-white/90 text-sm font-medium mb-1">
                  Actualizado hace unos momentos
                </div>
              </div>
              
              <!-- Content Section -->
              <div class="bg-gray-800 text-white px-5 py-6">
                <!-- Title -->
                <h3 class="text-white font-bold text-xl mb-2 transition-all duration-300">
                  {{ itemData.name || 'Mi Workspace' }}
                </h3>
                
                <!-- Description -->
                <p class="text-gray-300 text-sm mb-6 leading-relaxed transition-all duration-300">
                  {{ itemData.description || 'Describe brevemente el propósito de este workspace...' }}
                </p>
                
                <!-- Stats Row -->
                <div class="flex items-center gap-6 mb-6">
                  <div class="flex items-center gap-2">
                    <i class="fas fa-clipboard-list text-gray-400 text-sm"></i>
                    <span class="text-white font-medium">{{ getActiveBoardsCount() }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fas fa-users text-gray-400 text-sm"></i>
                    <span class="text-white font-medium">{{ getMembersCount() }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <i class="fas fa-tasks text-gray-400 text-sm"></i>
                    <span class="text-white font-medium">{{ getCompletedTasks() }}</span>
                  </div>
                </div>
                
                <!-- Action Button -->
                <div class="flex items-center gap-3">
                  <button class="flex-1 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                          [style.background]="getCurrentColor()"
                          [style.box-shadow]="'0 4px 12px ' + getCurrentColor() + '40'">
                    <i class="fas fa-external-link-alt text-sm"></i>
                    Abrir
                  </button>
                  
                  <!-- More Options -->
                  <button class="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                    <i class="fas fa-ellipsis-h text-gray-300"></i>
                  </button>
                </div>
              </div>
              
              <!-- Workspace Footer -->
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div class="flex items-center justify-between">
                  <span class="text-gray-500 dark:text-gray-400 text-xs">
                    Progreso general: {{ getProgressPercentage() }}%
                  </span>
                  <div class="w-16 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div class="h-full rounded-full preview-progress"
                         [style.background]="getCurrentColor()"
                         [style.width]="getProgressPercentage() + '%'"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Dynamic Tip -->
            <div class="mt-4 p-3 rounded-lg backdrop-blur-sm"
                 [ngClass]="config.type === 'board' ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-purple-900/20 border border-purple-700/50'">
              <div class="flex items-center gap-2">
                <i class="fas fa-info-circle text-sm" 
                   [ngClass]="config.type === 'board' ? 'text-blue-400' : 'text-purple-400'"></i>
                <p class="text-xs"
                   [ngClass]="config.type === 'board' ? 'text-blue-300' : 'text-purple-300'">
                  Vista previa del {{ config.type === 'board' ? 'board' : 'workspace' }} que estás creando
                </p>
              </div>
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  `,
  styleUrl: './create-modal.component.css'
})
export class CreateModalComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() isModalOpen = false;
  @Input() config: ModalConfig = { title: '', icon: '', type: 'workspace' };
  @Input() availableThemes: ThemeOption[] = [];
  @Input() availableIcons: IconCategory[] = [];
  @Input() colorPresets: string[] = ['#0075A2', '#6A4C93', '#2EC4B6', '#10B981', '#8B5CF6', '#06B6D4', '#6366F1', '#84CC16'];

  @Output() modalClosed = new EventEmitter<void>();
  @Output() itemCreated = new EventEmitter<CreateItemData>();

  @ViewChild('modalContainer', { static: false }) modalContainer!: ElementRef;
  @ViewChild('modalContent', { static: false }) modalContent!: ElementRef;
  @ViewChild('modalHeader', { static: false }) modalHeader!: ElementRef;

  itemData: CreateItemData = {
    name: '',
    description: '',
    theme: '',
    color: '#0075A2',
    icon: 'fa-briefcase',
    members: [],
    newMemberEmail: ''
  };

  // Animation states
  isAnimating = false;
  isClosing = false;
  isCreating = false;
  currentStep = 0;
  totalSteps = 4;

  // Icon selector properties
  showIconSelector = false;
  selectedIconCategory = 'general';
  
  iconCategories: IconCategory[] = [
    {
      category: 'general',
      icons: ['fa-briefcase', 'fa-folder', 'fa-file', 'fa-clipboard', 'fa-tasks', 'fa-calendar', 'fa-clock', 'fa-bookmark', 'fa-star', 'fa-flag', 'fa-home', 'fa-archive', 'fa-box', 'fa-cubes', 'fa-tag', 'fa-tags']
    },
    {
      category: 'business',
      icons: ['fa-chart-line', 'fa-pie-chart', 'fa-building', 'fa-handshake', 'fa-dollar-sign', 'fa-credit-card', 'fa-shopping-cart', 'fa-store', 'fa-industry', 'fa-chart-bar', 'fa-calculator', 'fa-balance-scale', 'fa-briefcase', 'fa-id-card', 'fa-trophy', 'fa-award']
    },
    {
      category: 'tech',
      icons: ['fa-code', 'fa-laptop', 'fa-mobile-alt', 'fa-database', 'fa-server', 'fa-wifi', 'fa-bug', 'fa-rocket', 'fa-cog', 'fa-microchip', 'fa-keyboard', 'fa-mouse', 'fa-desktop', 'fa-tablet', 'fa-hdd', 'fa-usb']
    },
    {
      category: 'creative',
      icons: ['fa-palette', 'fa-paint-brush', 'fa-camera', 'fa-video', 'fa-music', 'fa-pen', 'fa-pencil-alt', 'fa-magic', 'fa-film', 'fa-image', 'fa-microphone', 'fa-headphones', 'fa-guitar', 'fa-drum', 'fa-theater-masks', 'fa-rainbow']
    },
    {
      category: 'social',
      icons: ['fa-comments', 'fa-envelope', 'fa-phone', 'fa-users', 'fa-user-friends', 'fa-bullhorn', 'fa-share', 'fa-globe', 'fa-heart', 'fa-thumbs-up', 'fa-user', 'fa-user-plus', 'fa-user-check', 'fa-user-tie', 'fa-at', 'fa-hashtag']
    },
    {
      category: 'transport',
      icons: ['fa-car', 'fa-plane', 'fa-ship', 'fa-train', 'fa-bicycle', 'fa-motorcycle', 'fa-truck', 'fa-bus', 'fa-taxi', 'fa-subway', 'fa-helicopter', 'fa-rocket', 'fa-anchor', 'fa-road', 'fa-map', 'fa-compass']
    },
    {
      category: 'nature',
      icons: ['fa-leaf', 'fa-tree', 'fa-sun', 'fa-cloud', 'fa-water', 'fa-fire', 'fa-mountain', 'fa-seedling', 'fa-flower', 'fa-bug', 'fa-paw', 'fa-feather', 'fa-snowflake', 'fa-bolt', 'fa-wind', 'fa-moon']
    },
    {
      category: 'education',
      icons: ['fa-graduation-cap', 'fa-book', 'fa-university', 'fa-chalkboard', 'fa-pencil-ruler', 'fa-calculator', 'fa-flask', 'fa-microscope', 'fa-atom', 'fa-dna', 'fa-globe-americas', 'fa-language', 'fa-spell-check', 'fa-apple-alt', 'fa-user-graduate', 'fa-medal']
    }
  ];

  // UX Enhancement properties
  private tips = [
    'Un nombre descriptivo ayuda a identificar rápidamente el propósito del proyecto.',
    'Las descripciones detalladas mejoran la colaboración en equipo.',
    'Los colores consistentes crean una identidad visual profesional.',
    'Los iconos apropiados facilitan la navegación y organización.',
    'Agregar miembros desde el inicio acelera el flujo de trabajo.'
  ];

  constructor(private cdr: ChangeDetectorRef, private el: ElementRef) {}

  ngOnInit(): void {
    // Initialize default themes if not provided
    if (!this.availableThemes || this.availableThemes.length === 0) {
      this.availableThemes = [
        { id: 'professional', name: 'Profesional', color: '#0075A2', icon: 'fas fa-briefcase' },
        { id: 'creative', name: 'Creativo', color: '#6A4C93', icon: 'fas fa-palette' },
        { id: 'minimal', name: 'Minimal', color: '#2EC4B6', icon: 'fas fa-circle' },
        { id: 'nature', name: 'Naturaleza', color: '#10B981', icon: 'fas fa-leaf' },
        { id: 'tech', name: 'Tech', color: '#8B5CF6', icon: 'fas fa-code' },
        { id: 'ocean', name: 'Océano', color: '#06B6D4', icon: 'fas fa-water' },
        { id: 'space', name: 'Espacio', color: '#6366F1', icon: 'fas fa-rocket' },
        { id: 'energy', name: 'Energía', color: '#84CC16', icon: 'fas fa-bolt' }
      ];
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updateProgress();
    }, 100);
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isModalOpen']) {
      this.updateProgress();
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
      this.updateProgress();
    }
  }

  selectColor(color: string): void {
    this.itemData.color = color;
    this.updateProgress();
  }

  selectIcon(icon: string): void {
    this.itemData.icon = icon;
    this.showIconSelector = false;
    this.updateProgress();
  }

  getCurrentColor(): string {
    return this.itemData.color || '#0075A2';
  }

  getCurrentIcon(): string {
    return this.itemData.icon || 'fa-briefcase';
  }

  getSelectedThemeName(): string {
    const selectedTheme = this.availableThemes.find(t => t.id === this.itemData.theme);
    return selectedTheme ? selectedTheme.name : 'Personalizado';
  }

  getDescriptionSuggestions(): string[] {
    if (this.config.type === 'workspace') {
      return ['Colaborativo', 'Innovador', 'Ágil', 'Estratégico', 'Creativo'];
    } else {
      return ['Urgente', 'Semanal', 'Proyecto', 'Tareas', 'Seguimiento'];
    }
  }

  addDescriptionSuggestion(suggestion: string): void {
    const currentDesc = this.itemData.description.trim();
    const newDesc = currentDesc ? `${currentDesc} ${suggestion}` : suggestion;
    this.itemData.description = newDesc;
    this.updateProgress();
  }

  getRandomTip(): string {
    const randomIndex = Math.floor(Math.random() * this.tips.length);
    return this.tips[randomIndex];
  }

  getProgressPercentage(): number {
    return Math.round((this.currentStep / (this.totalSteps - 1)) * 100);
  }

  // Icon selector methods
  toggleIconSelector(): void {
    this.showIconSelector = !this.showIconSelector;
  }

  selectIconCategory(category: string): void {
    this.selectedIconCategory = category;
  }



  getSelectedCategoryIcons(): string[] {
    const category = this.iconCategories.find(cat => cat.category === this.selectedIconCategory);
    return category ? category.icons : [];
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      'general': 'fas fa-folder',
      'business': 'fas fa-chart-line',
      'tech': 'fas fa-code',
      'creative': 'fas fa-palette',
      'social': 'fas fa-users',
      'transport': 'fas fa-car',
      'nature': 'fas fa-leaf',
      'education': 'fas fa-graduation-cap'
    };
    return iconMap[category] || 'fas fa-circle';
  }

  updateProgress(): void {
    let progress = 0;
    if (this.itemData.name.trim()) progress++;
    if (this.itemData.description.trim()) progress++;
    if (this.itemData.theme) progress++;
    
    const newStep = Math.min(progress, this.totalSteps - 1);
    
    // Animate step change smoothly
    if (newStep !== this.currentStep) {
      // Add bounce animation to progress numbers
      const progressNumbers = this.el.nativeElement.querySelectorAll('.progress-number');
      progressNumbers.forEach((el: HTMLElement) => {
        el.classList.add('updating');
        setTimeout(() => {
          el.classList.remove('updating');
        }, 500);
      });
      
      setTimeout(() => {
        this.currentStep = newStep;
        this.cdr.detectChanges();
      }, 50);
    }
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
      this.isCreating = true;
      
      // Add success animation to button
      const createButton = this.el.nativeElement.querySelector('.create-button');
      if (createButton) {
        createButton.classList.add('success');
        setTimeout(() => {
          createButton.classList.remove('success');
        }, 600);
      }
      
      // Simple timeout to simulate the creation process
      setTimeout(() => {
        // Debug: Log data being sent
        console.log('Enviando datos del modal:', { ...this.itemData });
        this.itemCreated.emit({ ...this.itemData });
        this.resetForm();
        this.isCreating = false;
      }, 1000);
    }
  }

  getSelectedIcon(): string {
    return this.itemData.icon || 'fa-briefcase';
  }

  getCurrentStep(): number {
    return this.currentStep + 1;
  }

  getMemberInitials(email: string): string {
    const name = email.split('@')[0];
    return name.substring(0, 2).toUpperCase();
  }

  getAvatarColor(email: string): string {
    const colors = ['#0075A2', '#4B9BE8', '#6A4C93', '#10B981', '#8B5CF6', '#06B6D4', '#84CC16', '#FF6B6B'];
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getCompletedTasks(): number {
    return Math.floor(this.getProgressPercentage() * 16 / 100);
  }

  getPendingTasks(): number {
    return 16 - this.getCompletedTasks();
  }

  getActiveBoardsCount(): number {
    return Math.max(1, this.getCompletedTasks());
  }

  getMembersCount(): number {
    return Math.max(1, this.itemData.members.length);
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
    this.currentStep = 0;
    // Trigger change detection to update progress display
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }
}