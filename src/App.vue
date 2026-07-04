<template>
  <div class="min-h-screen bg-stone-100 flex flex-col text-stone-800">
    <!-- Header -->
    <header class="bg-white border-b border-stone-200 sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 gap-2">
          <div class="flex items-center gap-3 min-w-0">
            <div class="h-9 w-9 rounded-lg bg-tobacco-50 flex items-center justify-center flex-shrink-0">
              <img src="/logo.svg" class="h-6 w-6" alt="Pipa">
            </div>
            <div class="min-w-0">
              <h1 class="text-base font-bold text-stone-900 leading-tight tracking-tight truncate">Tabacos de Pipa</h1>
              <p class="hidden sm:block text-[11px] text-stone-400 leading-snug">
                Datos del
                <a href="https://www.hacienda.gob.es/es-ES/Areas%20Tematicas/CMTabacos/Paginas/PreciosLabores.aspx"
                  target="_blank" class="text-tobacco-600 hover:underline">Min. de Hacienda</a>,
                el
                <a href="https://www.boe.es/" target="_blank" class="text-tobacco-600 hover:underline">BOE</a>
                y
                <a href="https://www.tobaccoreviews.com/" target="_blank" class="text-tobacco-600 hover:underline">TobaccoReviews</a>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <!-- Add stock button (Stock mode only; sits left of Bodega) -->
            <button v-if="user && stockMode" @click="openAddStockModal" title="Añadir a bodega"
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-stone-300 text-stone-600 hover:border-tobacco-400 hover:text-tobacco-600 hover:bg-tobacco-50 transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <!-- Stock / Selling mode switch (only when logged in) -->
            <div v-if="user" class="inline-flex bg-stone-200 rounded-md p-0.5 gap-0.5">
              <button @click="setStockMode(true)"
                :class="stockMode ? 'bg-white text-tobacco-700 shadow-md' : 'text-stone-500 hover:text-stone-700'"
                class="inline-flex flex-col items-center justify-center px-2 py-0.5 rounded text-xs font-semibold transition-all whitespace-nowrap leading-tight">
                <span class="inline-flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Bodega
                </span>
                <span v-if="ownedCount()" class="text-[11px] font-semibold mt-0.5" :class="stockMode ? 'text-tobacco-600' : 'text-stone-500'">{{ ownedCount() }} · {{ formatKg(totalGrams()) }}</span>
              </button>
              <button @click="setStockMode(false)"
                :class="!stockMode ? 'bg-white text-tobacco-700 shadow-md' : 'text-stone-500 hover:text-stone-700'"
                class="px-2.5 py-1.5 rounded text-xs font-semibold transition-all whitespace-nowrap">
                Venta
              </button>
            </div>
            <!-- Filters button -->
            <button v-if="!showAnalytics" @click="showFiltersPanel = !showFiltersPanel"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
              :class="activeFilterCount > 0 || showFiltersPanel ? 'border-tobacco-400 text-tobacco-700 bg-tobacco-50' : 'border-stone-300 text-stone-600 bg-white hover:border-stone-400'">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span class="hidden sm:inline">Filtros</span>
              <span class="inline-flex items-center justify-center min-w-[1.1rem] h-[1.1rem] px-1 rounded-full text-[10px] font-bold transition-colors"
                :class="activeFilterCount > 0 ? 'bg-tobacco-500 text-white' : 'bg-transparent text-transparent'">{{ activeFilterCount > 0 ? activeFilterCount : '0' }}</span>
            </button>
            <!-- Analytics button (when logged in) -->
            <button v-if="user" @click="showAnalytics = !showAnalytics"
              class="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-all"
              :class="showAnalytics ? 'border-tobacco-400 text-tobacco-700 bg-tobacco-50' : 'border-stone-300 text-stone-600 bg-white hover:border-stone-400'"
              title="Hábitos de consumo">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <!-- Auth area: single user menu -->
            <div v-if="user" class="relative">
              <button @click="showUserMenu = !showUserMenu"
                class="flex items-center rounded-full hover:ring-2 hover:ring-tobacco-200 transition-all"
                :class="showUserMenu ? 'ring-2 ring-tobacco-300' : ''">
                <img v-if="user.photoURL" :src="user.photoURL" :alt="user.displayName || ''"
                  class="h-8 w-8 rounded-full border border-stone-200" referrerpolicy="no-referrer">
                <div v-else class="h-8 w-8 rounded-full bg-tobacco-100 flex items-center justify-center text-tobacco-700 font-bold text-xs">
                  {{ (user.displayName || user.email || '?')[0].toUpperCase() }}
                </div>
              </button>
              <!-- User dropdown menu -->
              <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
                <div v-if="showUserMenu" class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-stone-200 py-1 z-50">
                  <div class="px-3 py-2 border-b border-stone-100">
                    <p class="text-xs font-semibold text-stone-900 truncate">{{ user.displayName || 'Usuario' }}</p>
                    <p class="text-[11px] text-stone-400 truncate">{{ user.email }}</p>
                  </div>
                  <button @click="exportCSV(); showUserMenu = false"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 transition-colors">
                    <svg class="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Descargar CSV
                  </button>
                  <button @click="doLogout(); showUserMenu = false"
                    class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              </Transition>
            </div>
            <div v-if="user && showUserMenu" class="fixed inset-0 z-40" @click="showUserMenu = false"></div>
            <button v-if="!user && authReady" @click="showLoginModal = true"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-tobacco-500 text-white hover:bg-tobacco-600 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>

      <!-- Filters dropdown panel -->
      <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
        <div v-if="showFiltersPanel" class="border-t border-stone-200 bg-white shadow-lg">
          <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
            <!-- Region switch -->
            <div class="flex justify-center">
              <div class="inline-flex bg-stone-200 rounded-lg p-1 gap-1">
                <button @click="setSelectedRegion('pb')"
                  :class="selectedRegion === 'pb' ? 'bg-white text-tobacco-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'"
                  class="px-4 py-1.5 rounded-md text-sm font-semibold transition-all">
                  Península e Illes Balears
                </button>
                <button @click="setSelectedRegion('cm')"
                  :class="selectedRegion === 'cm' ? 'bg-white text-tobacco-700 shadow-sm' : 'text-stone-600 hover:text-stone-900'"
                  class="px-4 py-1.5 rounded-md text-sm font-semibold transition-all">
                  Ceuta y Melilla
                </button>
              </div>
            </div>

            <!-- Filters row -->
            <div class="flex flex-wrap gap-2 justify-center items-center">
              <!-- Brand -->
              <div class="relative">
                <select v-model="selectedBrand" aria-label="Fabricante"
                  :class="selectedBrand ? 'border-tobacco-400 ring-1 ring-tobacco-400 text-stone-900 font-semibold' : 'border-stone-300 text-stone-500'"
                  class="appearance-none bg-white border text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-tobacco-400 focus:border-tobacco-400 block w-44 pl-3 pr-9 py-2 cursor-pointer hover:border-stone-400 transition-colors">
                  <option value="">Fabricante</option>
                  <option v-for="brand in brands" :key="brand" :value="brand" class="text-stone-900 font-normal">{{ brand }}</option>
                </select>
                <button v-if="selectedBrand" @click.stop="selectedBrand = ''"
                  class="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200" aria-label="Limpiar">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <svg v-else class="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              <div class="h-6 w-px bg-stone-200 mx-1"></div>

              <!-- Sort -->
              <div class="flex flex-wrap gap-1.5">
                <button v-for="option in sortOptions" :key="option.value" @click="sort = option.value"
                  :class="sort === option.value ? 'bg-tobacco-500 text-white border-tobacco-500' : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'"
                  class="px-3 py-1.5 rounded-md text-xs font-semibold border transition-all whitespace-nowrap">
                  {{ option.label }}
                </button>
              </div>
            </div>

            <!-- Property filters row -->
            <div class="flex flex-wrap gap-2 justify-center items-center">
              <div v-for="f in propertyFilters" :key="f.key" class="relative">
                <select v-model="selectedProperties[f.key]" :aria-label="f.label"
                  :class="selectedProperties[f.key] ? 'border-tobacco-400 ring-1 ring-tobacco-400 text-stone-900 font-semibold' : 'border-stone-300 text-stone-500'"
                  class="appearance-none bg-white border text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-tobacco-400 focus:border-tobacco-400 block w-44 pl-3 pr-9 py-2 cursor-pointer hover:border-stone-400 transition-colors">
                  <option value="">{{ f.label }}</option>
                  <option v-for="val in propertyValues(f.key)" :key="val" :value="val" class="text-stone-900 font-normal">{{ val }}</option>
                </select>
                <button v-if="selectedProperties[f.key]" @click.stop="selectedProperties[f.key] = ''"
                  class="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200" aria-label="Limpiar">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
                <svg v-else class="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <!-- Clear filters -->
            <div v-if="hasActiveFilters" class="flex items-center justify-center text-sm">
              <button @click="clearFilters"
                class="text-xs text-tobacco-600 hover:text-tobacco-700 font-semibold underline underline-offset-2">
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Click-outside backdrop for filters panel -->
    <div v-if="showFiltersPanel" class="fixed inset-0 z-30" @click="showFiltersPanel = false"></div>

    <!-- Grid -->
    <main v-if="!showAnalytics" class="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <div v-if="!loaded" class="flex justify-center py-24">
        <div class="animate-spin rounded-full h-10 w-10 border-2 border-stone-200 border-t-tobacco-500"></div>
      </div>

      <div v-else-if="filteredCount === 0" class="text-center py-24 text-stone-400">
        <svg class="w-14 h-14 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-lg font-semibold text-stone-500">No se encontraron resultados</p>
        <p class="text-sm mt-1">Prueba a cambiar los filtros</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div v-for="tobacco in pageContent" :key="tobacco.brand + tobacco.blend" @click="selectedTobacco = tobacco"
          class="group relative bg-white rounded-xl border border-stone-200 hover:border-stone-300 hover:shadow-md cursor-pointer transition-all duration-150 overflow-hidden flex flex-col">
          <!-- Logo watermark background -->
          <img v-if="logos.includes(tobacco.brand)" :src="`/logos/${tobacco.brand}.svg`" aria-hidden="true" loading="lazy" decoding="async"
            class="pointer-events-none absolute inset-0 w-full h-full object-contain p-4 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-150 select-none"
            style="transform: scale(1.4, 1.4);" />

          <!-- Brand header -->
          <div class="relative px-4 pt-4 pb-3 flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <h3 class="font-bold text-stone-900 text-sm leading-tight truncate">{{ tobacco.brand }}</h3>
                <span v-if="isRecent(tobacco)" class="flex-shrink-0 h-2 w-2 rounded-full bg-tobacco-500" title="Actualizado recientemente"></span>
              </div>
              <p class="text-xs text-stone-500 mt-0.5 truncate">{{ tobacco.blend || '—' }}</p>
            </div>
            <!-- Right actions: favourite + inventory -->
            <div class="relative flex-shrink-0 flex items-start gap-1">
              <!-- Favourite heart (when logged in) -->
              <button v-if="user" @click.stop="toggleFavourite(tobacco)" title="Marcar como favorito"
                class="p-1 rounded transition-colors"
                :class="isFavourite(tobacco) ? 'text-red-500 hover:text-red-600' : 'text-stone-300 hover:text-red-400 hover:bg-red-50'">
                <svg class="w-4 h-4" :fill="isFavourite(tobacco) ? 'currentColor' : 'none'" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <!-- Inventory grams badge (when logged in & has grams) -->
              <button v-if="user && getGrams(tobacco) > 0" @click.stop="openInventoryModal(tobacco)"
                class="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-tobacco-50 text-tobacco-700 hover:bg-tobacco-100 transition-colors">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                {{ getGrams(tobacco) }} g
              </button>
              <!-- Inventory add button (when logged in & no grams) -->
              <button v-else-if="user" @click.stop="openInventoryModal(tobacco)"
                class="p-1 rounded text-stone-300 hover:text-tobacco-600 hover:bg-tobacco-50 transition-colors" title="Añadir al inventario">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Sizes & prices -->
          <div class="relative px-4 pb-3 flex-1">
            <div class="divide-y divide-stone-100">
              <div v-for="size in sortedSizes(tobacco.sizes)" :key="size.grams"
                class="flex items-center justify-between gap-2 py-2">
                <span class="inline-flex items-center justify-center min-w-[2.75rem] h-6 px-2 rounded-md text-xs font-bold bg-stone-100 text-stone-600">
                  {{ size.grams }} g
                </span>
                <div class="flex items-baseline gap-1.5 ml-auto">
                  <span v-if="lastChange(size)"
                    class="inline-flex items-center gap-0.5 text-[10px] font-bold px-1 py-0.5 rounded tabular-nums"
                    :class="lastChange(size).amount > 0 ? 'text-up bg-red-50' : 'text-down bg-blue-50'">
                    <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                      <path v-if="lastChange(size).amount > 0" d="M10 3l6 8h-4v6H8v-6H4l6-8z" />
                      <path v-else d="M10 17l-6-8h4V3h4v6h4l-6 8z" />
                    </svg>
                    {{ lastChange(size).amount > 0 ? '+' : '' }}{{ lastChange(size).amount.toFixed(2) }}€
                  </span>
                  <span class="text-base font-bold text-stone-900 tabular-nums">{{ size.currentPrice.toFixed(2) }}€</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Property badges -->
          <div v-if="hasProperties(tobacco)" class="relative px-4 pb-3 flex flex-col gap-1">
            <span v-for="p in cardProperties(tobacco)" :key="p.key"
              class="inline-flex items-start text-[10px] rounded border border-tobacco-100 overflow-hidden w-full">
              <span class="px-1.5 py-0.5 bg-tobacco-50 text-tobacco-700 font-bold whitespace-nowrap flex-shrink-0 w-20 self-stretch">{{ p.label }}</span>
              <span class="px-1.5 py-0.5 bg-white text-stone-800 font-bold break-words">{{ p.value }}</span>
            </span>
          </div>

          <!-- Footer -->
          <div class="relative px-4 py-2 border-t border-stone-100 flex items-center justify-between text-stone-400">
            <span class="inline-flex items-center gap-1 text-[10px]">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {{ latestUpdate(tobacco) }}
            </span>
            <div class="flex items-center gap-2">
              <span v-if="!user" class="text-[10px] font-medium group-hover:text-tobacco-600 transition-colors">Ver historial →</span>
              <span v-if="user" class="text-[10px] font-medium group-hover:text-tobacco-600 transition-colors">Historial →</span>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Analytics view -->
    <main v-if="showAnalytics && user" class="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <!-- Header row -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-bold text-stone-900">Hábitos de consumo</h2>
          <p class="text-sm text-stone-500 mt-0.5">Análisis de tu bodega y favoritos</p>
        </div>
        <button @click="showAnalytics = false"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-stone-300 text-stone-600 bg-white hover:border-stone-400 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </div>

      <!-- Empty state -->
      <div v-if="analyticsItems.length === 0" class="text-center py-24 text-stone-400">
        <svg class="w-14 h-14 mx-auto mb-4 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <p class="text-lg font-semibold text-stone-500">Tu bodega está vacía</p>
        <p class="text-sm mt-1">Añade tabacos a tu bodega o márcalos como favoritos para ver tus hábitos de consumo.</p>
      </div>

      <div v-else class="space-y-6">
        <!-- Mode toggle -->
        <div class="flex justify-center">
          <div class="inline-flex bg-stone-200 rounded-lg p-1 gap-1">
            <button @click="analyticsMode = 'count'"
              :class="analyticsMode === 'count' ? 'bg-white text-tobacco-700 shadow-md' : 'text-stone-600 hover:text-stone-900'"
              class="px-4 py-1.5 rounded-md text-sm font-semibold transition-all">
              Por número de mezclas
            </button>
            <button @click="analyticsMode = 'grams'"
              :class="analyticsMode === 'grams' ? 'bg-white text-tobacco-700 shadow-md' : 'text-stone-600 hover:text-stone-900'"
              class="px-4 py-1.5 rounded-md text-sm font-semibold transition-all">
              Por gramos (ponderado)
            </button>
          </div>
        </div>
        <p v-if="analyticsMode === 'grams'" class="text-center text-xs text-stone-400">
          Los gramos se normalizan de 0 a 1 (el máximo = 1.0). Los favoritos siempre cuentan como 1.0.
        </p>
        <p v-else class="text-center text-xs text-stone-400">
          Cada mezcla cuenta como 1, independientemente de los gramos.
        </p>

        <!-- Dimensions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="dim in analyticsDimensions" :key="dim.key"
            class="bg-white rounded-xl border border-stone-200 p-4">
            <h3 class="text-sm font-bold text-stone-900 mb-3">{{ dim.label }}</h3>
            <div v-if="dim.values.length === 0" class="text-xs text-stone-400">Sin datos</div>
            <div v-else class="space-y-2">
              <div v-for="row in dim.values" :key="row.value" class="flex items-center gap-2">
                <span class="w-28 text-xs font-medium text-stone-700 truncate flex-shrink-0" :title="row.value">{{ row.value }}</span>
                <div class="flex-1 bg-stone-100 rounded-full h-3 overflow-hidden relative">
                  <div class="h-3 rounded-full transition-all duration-300 bg-tobacco-500"
                    :style="{ width: row.pct + '%' }"></div>
                </div>
                <span class="w-12 text-right text-xs font-bold text-stone-600 tabular-nums flex-shrink-0">{{ row.pct.toFixed(0) }}%</span>
                <span class="w-20 text-right text-[10px] text-stone-400 tabular-nums flex-shrink-0 whitespace-nowrap">{{ row.count }} · {{ row.grams }}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Detail Modal -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="selectedTobacco" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-stone-900/75" @click="selectedTobacco = undefined"></div>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <Transition enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95">
              <div v-if="selectedTobacco" class="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
                <!-- Logo watermark background -->
                <img v-if="logos.includes(selectedTobacco.brand)" :src="`/logos/${selectedTobacco.brand}.svg`" aria-hidden="true"
                  class="pointer-events-none absolute inset-0 w-full h-full object-contain p-8 opacity-[0.05] select-none z-0"
                  style="transform: scale(1.4, 1.4);" />
                <!-- Header -->
                <div class="bg-stone-900 px-6 py-5 relative z-10">
                  <button @click="selectedTobacco = undefined"
                    class="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full text-stone-300 hover:text-white hover:bg-white/15 transition-colors">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div class="flex items-center gap-3 pr-10">
                    <div v-if="logos.includes(selectedTobacco.brand)"
                      class="w-12 h-12 rounded-lg bg-white p-1.5 flex items-center justify-center flex-shrink-0">
                      <img :src="`/logos/${selectedTobacco.brand}.svg`" :alt="selectedTobacco.brand"
                        class="max-w-full max-h-full object-contain">
                    </div>
                    <div class="flex-1 min-w-0">
                      <h3 class="text-lg font-bold text-tobacco-300 leading-tight truncate">{{ selectedTobacco.brand }}</h3>
                      <p class="text-stone-400 text-sm truncate">{{ selectedTobacco.blend || '—' }}</p>
                    </div>
                  </div>
                </div>

                <!-- Body -->
                <div class="px-6 py-5 space-y-6 max-h-[60vh] overflow-y-auto relative z-10">

                  <div v-for="size in sortedSizes(selectedTobacco.sizes)" :key="size.grams">
                    <!-- Size summary -->
                    <div class="flex items-baseline justify-between mb-4">
                      <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-bold bg-stone-100 text-stone-700">
                        {{ size.grams }} g
                      </span>
                      <div class="text-right">
                        <span class="text-xl font-bold text-stone-900 tabular-nums">{{ size.currentPrice.toFixed(2) }}€</span>
                        <span v-if="size.grams > 0" class="block text-xs text-stone-400 tabular-nums">
                          {{ (size.currentPrice / size.grams * 1000).toFixed(2) }}€/kg
                        </span>
                      </div>
                    </div>

                    <!-- Timeline -->
                    <ol class="relative border-l-2 border-stone-200 ml-1.5 space-y-4">
                      <li v-for="(price, idx) in size.priceHistory" :key="price.date" class="pl-5 relative">
                        <div class="flex items-center justify-between gap-2">
                          <span class="text-sm text-stone-500 tabular-nums">{{ price.date }}</span>
                          <div class="flex items-baseline gap-2">
                            <span v-if="idx < size.priceHistory.length - 1"
                              class="inline-flex items-center gap-0.5 text-[10px] font-bold px-1 py-0.5 rounded tabular-nums"
                              :class="price.price - size.priceHistory[idx + 1].price > 0 ? 'text-up bg-red-50' : 'text-down bg-blue-50'">
                              <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path v-if="price.price - size.priceHistory[idx + 1].price > 0" d="M10 3l6 8h-4v6H8v-6H4l6-8z" />
                                <path v-else d="M10 17l-6-8h4V3h4v6h4l-6 8z" />
                              </svg>
                              {{ (price.price - size.priceHistory[idx + 1].price) > 0 ? '+' : '' }}{{ (price.price - size.priceHistory[idx + 1].price).toFixed(2) }}€
                            </span>
                            <span class="text-sm font-bold text-stone-900 tabular-nums">{{ price.price.toFixed(2) }}€</span>
                          </div>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>

                <!-- Footer -->
                <div class="bg-stone-50 px-6 py-3 border-t border-stone-200 space-y-2 relative z-10">
                  <button v-if="user" @click="openInventoryModal(selectedTobacco)"
                    class="w-full py-2.5 bg-tobacco-50 text-tobacco-700 font-semibold rounded-lg hover:bg-tobacco-100 transition-colors text-sm flex items-center justify-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {{ getGrams(selectedTobacco) > 0 ? `Tienes ${getGrams(selectedTobacco)} g` : 'Añadir al inventario' }}
                  </button>
                  <button @click="selectedTobacco = undefined"
                    class="w-full py-2.5 bg-stone-900 text-white font-semibold rounded-lg hover:bg-stone-800 transition-colors text-sm">
                    Cerrar
                  </button>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Login Modal -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showLoginModal" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-stone-900/75" @click="showLoginModal = false"></div>
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
              <button @click="showLoginModal = false"
                class="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div class="px-6 pt-8 pb-6 text-center">
                <div class="h-12 w-12 rounded-xl bg-tobacco-50 flex items-center justify-center mx-auto mb-4">
                  <img src="/logo.svg" class="h-7 w-7" alt="Pipa">
                </div>
                <h3 class="text-lg font-bold text-stone-900">Iniciar sesión</h3>
                <p class="text-sm text-stone-500 mt-1">Guarda tu inventario de tabacos y sincronízalo entre dispositivos.</p>
                <p v-if="authError" class="text-xs text-red-600 mt-3 bg-red-50 rounded-lg px-3 py-2">{{ authError }}</p>
                <div class="mt-6 space-y-2.5">
                  <button @click="doLogin('google')"
                    class="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors text-sm font-semibold text-stone-700">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continuar con Google
                  </button>
                  <button @click="doLogin('apple')"
                    class="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg bg-black hover:bg-stone-800 transition-colors text-sm font-semibold text-white">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Continuar con Apple
                  </button>
                </div>
                <p class="text-[11px] text-stone-400 mt-4">No se crea ninguna cuenta con contraseña. Solo se usan proveedores externos para verificar tu identidad.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Inventory Modal -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showInventoryModal && inventoryEditingTobacco" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-stone-900/75" @click="showInventoryModal = false"></div>
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
              <button @click="showInventoryModal = false"
                class="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div class="px-6 pt-8 pb-6">
                <div class="flex items-center gap-3 mb-5">
                  <div v-if="logos.includes(inventoryEditingTobacco.brand)"
                    class="w-10 h-10 rounded-lg bg-stone-50 p-1 flex items-center justify-center flex-shrink-0">
                    <img :src="`/logos/${inventoryEditingTobacco.brand}.svg`" :alt="inventoryEditingTobacco.brand" class="max-w-full max-h-full object-contain">
                  </div>
                  <div class="min-w-0">
                    <h3 class="font-bold text-stone-900 text-sm truncate">{{ inventoryEditingTobacco.brand }}</h3>
                    <p class="text-xs text-stone-500 truncate">{{ inventoryEditingTobacco.blend || '—' }}</p>
                  </div>
                </div>
                <label class="block text-sm font-semibold text-stone-700 mb-1.5">Gramos en bodega</label>
                <input v-model="inventoryGramsInput" type="number" min="0" step="1" inputmode="numeric"
                  class="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-lg font-bold text-stone-900 text-center focus:outline-none focus:ring-2 focus:ring-tobacco-400 focus:border-tobacco-400"
                  placeholder="0" @keyup.enter="saveInventory()">
                <p class="text-[11px] text-stone-400 mt-2">Introduce 0 para eliminar del inventario.</p>
                <p v-if="authError" class="text-xs text-red-600 mt-2">{{ authError }}</p>
                <div class="flex gap-2 mt-5">
                  <button @click="showInventoryModal = false"
                    class="flex-1 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors text-sm">
                    Cancelar
                  </button>
                  <button @click="saveInventory()"
                    class="flex-1 py-2.5 rounded-lg bg-tobacco-500 text-white font-semibold hover:bg-tobacco-600 transition-colors text-sm">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Add Stock Modal -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="showAddStockModal" class="fixed inset-0 z-50">
        <div class="absolute inset-0 bg-stone-900/75" @click="showAddStockModal = false"></div>
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <div class="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
              <button @click="showAddStockModal = false"
                class="absolute right-4 top-4 h-8 w-8 flex items-center justify-center rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div class="px-6 pt-8 pb-6">
                <h3 class="text-lg font-bold text-stone-900">Añadir a bodega</h3>
                <p class="text-sm text-stone-500 mt-1">Registra un tabaco en tu inventario, aunque no se venda en España.</p>

                <!-- Brand autocomplete -->
                <label class="block text-sm font-semibold text-stone-700 mb-1.5 mt-5">Fabricante</label>
                <input v-model="addStockBrand" type="text" list="add-stock-brands" autocomplete="off"
                  placeholder="Ej. Peterson"
                  class="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-tobacco-400 focus:border-tobacco-400"
                  @input="onAddStockBrandInput">
                <datalist id="add-stock-brands">
                  <option v-for="b in addStockBrandOptions" :key="b" :value="b"></option>
                </datalist>

                <!-- Blend autocomplete -->
                <label class="block text-sm font-semibold text-stone-700 mb-1.5 mt-4">Labor</label>
                <input v-model="addStockBlend" type="text" list="add-stock-blends" autocomplete="off"
                  placeholder="Ej. Irish Flake"
                  class="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-tobacco-400 focus:border-tobacco-400">
                <datalist id="add-stock-blends">
                  <option v-for="b in addStockBlendOptions" :key="b" :value="b"></option>
                </datalist>

                <!-- Grams -->
                <label class="block text-sm font-semibold text-stone-700 mb-1.5 mt-4">Gramos en bodega</label>
                <input v-model="addStockGrams" type="number" min="0" step="1" inputmode="numeric"
                  class="w-full px-3 py-2.5 border border-stone-200 rounded-lg text-lg font-bold text-stone-900 text-center focus:outline-none focus:ring-2 focus:ring-tobacco-400 focus:border-tobacco-400"
                  placeholder="0" @keyup.enter="saveAddStock()">

                <!-- Property preview when brand+blend match a known tobacco -->
                <div v-if="addStockMatch" class="mt-4 rounded-lg border border-tobacco-100 bg-tobacco-50/40 p-3 space-y-1">
                  <div class="flex items-center gap-1.5 mb-1">
                    <span v-if="addStockMatch.source === 'catalog'" class="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">Vendido en España</span>
                    <span v-else class="inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">TobaccoReviews</span>
                  </div>
                  <span v-for="p in cardProperties(addStockMatch.tobacco)" :key="p.key"
                    class="inline-flex items-start text-[10px] rounded border border-tobacco-100 overflow-hidden w-full">
                    <span class="px-1.5 py-0.5 bg-tobacco-50 text-tobacco-700 font-bold whitespace-nowrap flex-shrink-0 w-20 self-stretch">{{ p.label }}</span>
                    <span class="px-1.5 py-0.5 bg-white text-stone-800 font-bold break-words">{{ p.value }}</span>
                  </span>
                </div>
                <p v-else-if="addStockBrand && addStockBlend" class="text-[11px] text-stone-400 mt-3">
                  No encontrado en el catálogo ni en TobaccoReviews. Se guardará como tabaco propio en tu inventario.
                </p>

                <p v-if="authError" class="text-xs text-red-600 mt-3">{{ authError }}</p>

                <div class="flex gap-2 mt-5">
                  <button @click="showAddStockModal = false"
                    class="flex-1 py-2.5 rounded-lg border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition-colors text-sm">
                    Cancelar
                  </button>
                  <button @click="saveAddStock()" :disabled="!canSaveAddStock"
                    class="flex-1 py-2.5 rounded-lg bg-tobacco-500 text-white font-semibold hover:bg-tobacco-600 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Mobile Filters Modal -->
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100" leave-to-class="opacity-0">
      <div v-if="false" class="fixed inset-0 z-50 md:hidden">
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { Tobacco } from '../lib/models/Tobacco'
import logoList from './logos.json'
import type { AuthUser } from './auth'
import type { InventoryEntry } from './inventory'
import { tobaccoId } from './tobacco-id'

const ITEMS_PER_PAGE = 3000
const RECENT_DAYS = 31

interface SortOption {
  label: string
  value: string
}

interface PropertyFilter {
  key: keyof Tobacco
  label: string
}

const PROPERTY_FILTERS: PropertyFilter[] = [
  { key: 'blend_type', label: 'Tipo' },
  { key: 'contents', label: 'Contenidos' },
  { key: 'cut', label: 'Corte' },
  { key: 'strength', label: 'Fuerza' },
  { key: 'flavoring_profile', label: 'Aromatizante' },
  { key: 'flavoring', label: 'Notas' },
  { key: 'room_note', label: 'Aroma' },
  { key: 'taste', label: 'Sabor' },
]

// Dimensions analyzed in the consumption-habits view.
// `array` marks properties whose value is a list (each element counted
// separately); `brand` is handled as a special dimension.
const ANALYTICS_DIMENSIONS: { key: string, label: string, array?: boolean }[] = [
  { key: 'brand', label: 'Fabricantes preferidos' },
  { key: 'blend_type', label: 'Tipo' },
  { key: 'contents', label: 'Contenidos', array: true },
  { key: 'cut', label: 'Corte' },
  { key: 'strength', label: 'Fuerza' },
  { key: 'flavoring_profile', label: 'Aromatizante' },
  { key: 'room_note', label: 'Aroma en sala' },
  { key: 'taste', label: 'Sabor' },
  { key: 'flavoring', label: 'Notas', array: true },
]

const STRENGTH_ORDER: string[] = [
  // Zero/none values first
  'Ninguno',
  'Imperceptible',
  // Pleasant room_note values (least intrusive)
  'Muy agradable',
  'Agradable',
  'Agradable a tolerable',
  'Tolerable',
  'Tolerable a fuerte',
  // Mild intensity scale
  'Extremadamente suave',
  'Extremadamente suave (plano)',
  'Muy suave',
  'Suave',
  'Suave a medio',
  'Medio',
  'Medio a intenso',
  'Medio a fuerte',
  'Intenso',
  'Fuerte',
  'Muy intenso',
  'Muy fuerte',
  'Extra intenso',
  'Extra fuerte',
  // Max intensity
  'Aplastante',
]

export default {
  data() {
    const data: {
      tobaccos: Tobacco[],
      brands: string[],
      selectedBrand: string,
      loaded: boolean,
      totalPages: number,
      currentPage: number,
      selectedRegion: string,
      selectedTobacco?: Tobacco,
      sort: string,
      logos: string[],
      selectedProperties: Record<string, string>,
      user: AuthUser | null,
      inventory: Record<string, InventoryEntry>,
      showLoginModal: boolean,
      showInventoryModal: boolean,
      showFiltersPanel: boolean,
      showAddStockModal: boolean,
      showUserMenu: boolean,
      showAnalytics: boolean,
      analyticsMode: 'count' | 'grams',
      inventoryEditingTobacco?: Tobacco,
      inventoryGramsInput: string,
      stockMode: boolean,
      trTobaccos: any[],
      trLoaded: boolean,
      trLoading: boolean,
      addStockBrand: string,
      addStockBlend: string,
      addStockGrams: string,
      authReady: boolean,
      authError: string
    } = {
      tobaccos: [],
      brands: [],
      loaded: false,
      totalPages: 0,
      currentPage: 1,
      selectedBrand: "",
      selectedRegion: "pb",
      selectedTobacco: undefined,
      sort: "",
      logos: logoList as string[],
      selectedProperties: PROPERTY_FILTERS.reduce((acc, f) => {
        acc[f.key] = ''
        return acc
      }, {} as Record<string, string>),
      user: null,
      inventory: {},
      showLoginModal: false,
      showInventoryModal: false,
      showFiltersPanel: false,
      showAddStockModal: false,
      showUserMenu: false,
      showAnalytics: false,
      analyticsMode: 'count',
      inventoryEditingTobacco: undefined,
      inventoryGramsInput: '',
      stockMode: false,
      trTobaccos: [],
      trLoaded: false,
      trLoading: false,
      addStockBrand: '',
      addStockBlend: '',
      addStockGrams: '',
      authReady: false,
      authError: ''
    }
    return data
  },
  created() {
    this.retrieveSelectedRegion()
    this.fetchTobaccos()
    this.initAuth()
  },
  computed: {
    sortOptions(): SortOption[] {
      const opts: SortOption[] = [
        { label: 'Recién actualizados', value: '' },
        { label: 'Más baratos', value: 'asc' },
        { label: 'Más caros', value: 'desc' },
        { label: 'Más baratos (kg)', value: 'ascKg' },
        { label: 'Más caros (kg)', value: 'descKg' },
      ]
      if (this.user) {
        opts.push({ label: 'Por cantidad', value: 'grams' })
      }
      return opts
    },
    hasActiveFilters(): boolean {
      return this.selectedBrand !== ""
        || Object.values(this.selectedProperties).some(v => v) || this.stockMode
    },
    activeFilterCount(): number {
      let n = 0
      if (this.selectedBrand !== "") n++
      if (this.stockMode) n++
      for (const v of Object.values(this.selectedProperties)) {
        if (v) n++
      }
      return n
    },
    propertyFilters(): PropertyFilter[] {
      return PROPERTY_FILTERS
    },
    pageContent(): Tobacco[] {
      const tobaccos = this.filterTobaccos()
      this.totalPages = Math.floor(tobaccos.length / ITEMS_PER_PAGE) + 1
      return tobaccos.slice((this.currentPage - 1) * ITEMS_PER_PAGE, this.currentPage * ITEMS_PER_PAGE)
    },
    filteredCount(): number {
      return this.filterTobaccos().length
    },
    // --- Add Stock modal computeds ---
    addStockBrandOptions(): string[] {
      const set = new Set<string>()
      for (const t of this.tobaccos) if (t.brand) set.add(t.brand)
      for (const e of this.trTobaccos) if (e.brand) set.add(e.brand)
      return [...set].sort((a, b) => a.localeCompare(b))
    },
    addStockBlendOptions(): string[] {
      const brand = this.addStockBrand.trim().toLowerCase()
      const set = new Set<string>()
      for (const t of this.tobaccos) {
        if ((!brand || t.brand?.toLowerCase() === brand) && t.blend) set.add(t.blend)
      }
      for (const e of this.trTobaccos) {
        if ((!brand || e.brand?.toLowerCase() === brand) && e.blend) set.add(e.blend)
      }
      return [...set].sort((a, b) => a.localeCompare(b))
    },
    addStockMatch(): { tobacco: Tobacco, source: 'catalog' | 'tr' } | null {
      const brand = this.addStockBrand.trim()
      const blend = this.addStockBlend.trim()
      if (!brand || !blend) return null
      const id = tobaccoId(brand, blend)
      const cat = this.catalogTobaccoMap()
      if (cat[id]) return { tobacco: cat[id], source: 'catalog' }
      const tr = this.trTobaccoMap()
      if (tr[id]) return { tobacco: this.tobaccoFromTr(tr[id]), source: 'tr' }
      return null
    },
    canSaveAddStock(): boolean {
      return this.addStockBrand.trim() !== '' && (parseInt(this.addStockGrams) || 0) > 0
    },
    // --- Analytics ---
    // Builds the list of tobaccos used for consumption-habits analysis.
    // Includes every inventory entry that is either in stock (grams > 0) or
    // favourited. Each item carries a `weight` used to aggregate preferences:
    //   - count mode: every tobacco = 1
    //   - grams mode: favourite → 1.0; otherwise grams normalized to the max
    analyticsItems(): { tobacco: Tobacco, grams: number, favourite: boolean, weight: number }[] {
      const catMap = this.catalogTobaccoMap()
      const raw: { tobacco: Tobacco, grams: number, favourite: boolean }[] = []
      for (const entry of Object.values(this.inventory)) {
        const inStock = (entry.grams || 0) > 0
        const isFav = !!entry.favourite
        if (!inStock && !isFav) continue
        const id = tobaccoId(entry.brand, entry.blend)
        const tobacco = catMap[id] || this.stubFromEntry(entry)
        raw.push({ tobacco, grams: entry.grams || 0, favourite: isFav })
      }
      const maxGrams = raw.reduce((m, i) => Math.max(m, i.grams), 0) || 1
      return raw.map(item => ({
        ...item,
        weight: this.analyticsMode === 'count'
          ? 1
          : (item.favourite ? 1.0 : item.grams / maxGrams),
      }))
    },
    // For each dimension, aggregates the weighted value frequencies and
    // returns the top values sorted by weight, with a percentage.
    // Null/undefined/empty values are skipped (not counted).
    analyticsDimensions(): { key: string, label: string, values: { value: string, weight: number, pct: number, count: number, grams: number }[] }[] {
      const items = this.analyticsItems
      return ANALYTICS_DIMENSIONS.map(dim => {
        const dimDef = ANALYTICS_DIMENSIONS.find(d => d.key === dim.key)!
        // value -> { weight, count, grams }
        const map = new Map<string, { weight: number, count: number, grams: number }>()
        for (const item of items) {
          const raw = (item.tobacco as any)[dim.key]
          let values: string[]
          if (dimDef.array && Array.isArray(raw)) {
            values = raw.map(String)
          } else if (Array.isArray(raw)) {
            values = raw.map(String)
          } else {
            values = [raw == null ? '' : String(raw)]
          }
          for (const v of values) {
            // Skip null/undefined/empty values
            if (!v) continue
            const cur = map.get(v) || { weight: 0, count: 0, grams: 0 }
            cur.weight += item.weight
            cur.count += 1
            cur.grams += item.grams
            map.set(v, cur)
          }
        }
        const total = [...map.values()].reduce((a, b) => a + b.weight, 0) || 1
        const values = [...map.entries()]
          .map(([value, agg]) => ({ value, weight: agg.weight, pct: (agg.weight / total) * 100, count: agg.count, grams: agg.grams }))
          .sort((a, b) => b.weight - a.weight)
        return { key: dim.key, label: dim.label, values }
      })
    }
  },
  methods: {
    parseDate(str: string): number {
      if (!str) return 0
      const [d, m, y] = str.split('/').map(n => parseInt(n))
      return new Date(y, m - 1, d).getTime()
    },
    latestUpdate(tobacco: Tobacco): string {
      let best = ""
      let bestTime = -1
      for (const size of tobacco.sizes) {
        const t = this.parseDate(size.lastUpdate)
        if (t > bestTime) {
          bestTime = t
          best = size.lastUpdate
        }
      }
      return best || "-"
    },
    latestUpdateTime(tobacco: Tobacco): number {
      return Math.max(...tobacco.sizes.map(s => this.parseDate(s.lastUpdate)))
    },
    isRecent(tobacco: Tobacco): boolean {
      const latest = this.latestUpdateTime(tobacco)
      if (!latest) return false
      const diffDays = (Date.now() - latest) / (1000 * 60 * 60 * 24)
      return diffDays >= 0 && diffDays <= RECENT_DAYS
    },
    lastChange(size: any): { amount: number, pct: number } | null {
      if (!size.priceHistory || size.priceHistory.length < 2) return null
      const current = size.priceHistory[0].price
      const previous = size.priceHistory[1].price
      const amount = current - previous
      if (amount === 0) return null
      return { amount, pct: (amount / previous) * 100 }
    },
    sortedSizes(sizes: any[]) {
      return [...sizes].sort((a, b) => a.grams - b.grams)
    },
    propertyValues(key: string): string[] {
      const vals = new Set<string>()
      for (const t of this.tobaccos) {
        const v = (t as any)[key]
        if (Array.isArray(v)) {
          for (const item of v) vals.add(String(item))
        } else if (v) {
          vals.add(String(v))
        }
      }
      const arr = [...vals]
      const orderedKeys = ['strength', 'flavoring_profile', 'room_note', 'taste']
      if (orderedKeys.includes(key)) {
        arr.sort((a, b) => {
          const ia = STRENGTH_ORDER.indexOf(a)
          const ib = STRENGTH_ORDER.indexOf(b)
          // Unknown values go last, preserving alphabetical among themselves
          if (ia === -1 && ib === -1) return a.localeCompare(b)
          if (ia === -1) return 1
          if (ib === -1) return -1
          return ia - ib
        })
      } else {
        arr.sort((a, b) => a.localeCompare(b))
      }
      return arr
    },
    hasProperties(tobacco: Tobacco): boolean {
      return this.cardProperties(tobacco).length > 0
    },
    cardProperties(tobacco: Tobacco): { key: string, label: string, value: string }[] {
      // Short labels for cards; includes contents (excluded from filters)
      const cardKeys = [
        { key: 'blend_type', label: 'Tipo' },
        { key: 'contents', label: 'Contenidos' },
        { key: 'cut', label: 'Corte' },
        { key: 'strength', label: 'Fuerza' },
        { key: 'flavoring_profile', label: 'Aroma' },
        { key: 'flavoring', label: 'Notas' },
        { key: 'room_note', label: 'Sala' },
        { key: 'taste', label: 'Sabor' },
      ]
      return cardKeys
        .map(f => {
          const raw = (tobacco as any)[f.key]
          let value = ''
          if (Array.isArray(raw)) value = raw.join(', ')
          else if (raw) value = String(raw)
          return { key: f.key, label: f.label, value }
        })
        .filter(p => p.value)
    },
    fetchTobaccos() {
      this.loaded = false
      fetch(`/${this.selectedRegion}.json`)
        .then((response) => response.json())
        .then((data) => {
          this.tobaccos = data
          this.loaded = true
          this.brands = [...new Set(this.tobaccos.map(t => t.brand).sort())]
        })
    },
    retrieveSelectedRegion() {
      let region = localStorage.getItem("REGION")
      if (region == null || !['pb', 'cm'].includes(region)) {
        region = 'pb'
      }
      this.selectedRegion = region
    },
    setSelectedRegion(region: string) {
      this.selectedRegion = region
      localStorage.setItem("REGION", region)
      this.clearFilters()
      this.fetchTobaccos()
    },
    clearFilters() {
      this.currentPage = 1
      this.selectedBrand = ""
      this.stockMode = false
      for (const f of PROPERTY_FILTERS) {
        this.selectedProperties[f.key] = ''
      }
    },
    filterTobaccos(): Tobacco[] {
      // In Stock Mode, the base list is the user's owned tobaccos — including
      // ones not sold in Spain (synthesized from tr.json or minimal stubs).
      let baseTobaccos = this.tobaccos
      if (this.stockMode) {
        baseTobaccos = this.buildStockTobaccos()
      }

      let filteredTobaccos = baseTobaccos
        .filter(t => {
          let res = true
          if (this.selectedBrand != "") {
            res = t.brand == this.selectedBrand
          }
          if (res && this.stockMode) {
            // Keep tobaccos that are in stock or favourited.
            const id = tobaccoId(t.brand, t.blend)
            const entry = this.inventory[id]
            const inStock = (entry?.grams || 0) > 0
            const isFav = !!entry?.favourite
            res = inStock || isFav
          }
          if (res) {
            for (const f of PROPERTY_FILTERS) {
              const sel = this.selectedProperties[f.key]
              if (sel) {
                const raw = (t as any)[f.key]
                if (Array.isArray(raw)) {
                  if (!raw.map(String).includes(sel)) {
                    res = false
                    break
                  }
                } else if (String(raw ?? '') !== sel) {
                  res = false
                  break
                }
              }
            }
          }
          return res
        })

      if (this.sort == "grams") {
        filteredTobaccos = [...filteredTobaccos].sort((a, b) => this.getGrams(b) - this.getGrams(a))
      } else if (this.sort == "") {
        filteredTobaccos = [...filteredTobaccos].sort((a, b) => this.latestUpdateTime(b) - this.latestUpdateTime(a))
      } else {
        filteredTobaccos = [...filteredTobaccos].sort((a, b) => {
          let priceA = Math.max(...a.sizes.map(s => s.currentPrice))
          let priceB = Math.max(...b.sizes.map(s => s.currentPrice))

          if (this.sort.endsWith("Kg")) {
            priceA = Math.max(...a.sizes.map(s => s.currentPrice / s.grams))
            priceB = Math.max(...b.sizes.map(s => s.currentPrice / s.grams))
          }

          const res = priceA - priceB
          return this.sort.startsWith("asc") ? res : -res
        })
      }

      return filteredTobaccos;
    },
    // --- Auth ---
    async initAuth() {
      const { onAuthChange, handleRedirectResult } = await import('./auth')
      handleRedirectResult().catch((e: any) => {
        this.authError = e?.message || 'Error al iniciar sesión'
      })
      onAuthChange(async (user) => {
        this.user = user
        this.authReady = true
        if (user) {
          this.showLoginModal = false
          const { subscribeInventory } = await import('./inventory')
          subscribeInventory(user.uid, (entries) => {
            this.inventory = entries
          })
        } else {
          this.inventory = {}
        }
      })
    },
    async doLogin(provider: 'google' | 'apple' | 'facebook') {
      this.authError = ''
      try {
        const auth = await import('./auth')
        if (provider === 'google') await auth.signInWithGoogle()
        else if (provider === 'apple') await auth.signInWithApple()
      } catch (e: any) {
        this.authError = e?.message || 'Error al iniciar sesión'
      }
    },
    async doLogout() {
      const { signOutUser } = await import('./auth')
      await signOutUser()
      this.stockMode = false
      this.showAnalytics = false
      if (this.sort === 'grams') this.sort = ''
    },
    // --- Inventory ---
    getGrams(tobacco: Tobacco): number {
      const id = tobaccoId(tobacco.brand, tobacco.blend)
      return this.inventory[id]?.grams ?? 0
    },
    isFavourite(tobacco: Tobacco): boolean {
      const id = tobaccoId(tobacco.brand, tobacco.blend)
      return !!this.inventory[id]?.favourite
    },
    async toggleFavourite(tobacco: Tobacco) {
      try {
        const { toggleFavourite: tf } = await import('./inventory')
        await tf(tobacco.brand, tobacco.blend, !this.isFavourite(tobacco))
      } catch (e: any) {
        this.authError = e?.message || 'Error al guardar favorito'
      }
    },
    openInventoryModal(tobacco: Tobacco) {
      this.inventoryEditingTobacco = tobacco
      this.inventoryGramsInput = String(this.getGrams(tobacco) || '')
      this.showInventoryModal = true
    },
    async saveInventory() {
      if (!this.inventoryEditingTobacco) return
      const grams = parseInt(this.inventoryGramsInput) || 0
      try {
        const { setGrams: sg } = await import('./inventory')
        await sg(this.inventoryEditingTobacco, grams)
        this.showInventoryModal = false
        this.inventoryEditingTobacco = undefined
      } catch (e: any) {
        this.authError = e?.message || 'Error al guardar'
      }
    },
    // --- Stock mode & tr.json ---
    async setStockMode(enabled: boolean) {
      this.stockMode = enabled
      if (enabled) {
        await this.ensureTrLoaded()
      }
    },
    async ensureTrLoaded() {
      if (this.trLoaded || this.trLoading) return
      this.trLoading = true
      try {
        const res = await fetch('/tr.json')
        this.trTobaccos = await res.json()
        this.trLoaded = true
      } catch (e: any) {
        // Non-fatal: stock mode still works for catalog/custom tobaccos
        console.error('Failed to load tr.json', e)
      } finally {
        this.trLoading = false
      }
    },
    // Build a catalog-keyed map by tobaccoId for fast lookup
    catalogTobaccoMap(): Record<string, Tobacco> {
      const map: Record<string, Tobacco> = {}
      for (const t of this.tobaccos) {
        if (!t.brand) continue
        map[tobaccoId(t.brand, t.blend)] = t
      }
      return map
    },
    trTobaccoMap(): Record<string, any> {
      const map: Record<string, any> = {}
      for (const e of this.trTobaccos) {
        if (!e.brand) continue
        map[tobaccoId(e.brand, e.blend)] = e
      }
      return map
    },
    // In Stock Mode, the list of owned tobaccos — including ones not sold in
    // Spain. Catalog tobaccos come from the active region; all others are
    // rebuilt from the stored inventory entry (which carries its properties
    // for non-catalog tobaccos), so the list is self-contained and updates
    // reactively as soon as the inventory changes.
    buildStockTobaccos(): Tobacco[] {
      const catMap = this.catalogTobaccoMap()
      const result: Tobacco[] = []
      const seen = new Set<string>()
      for (const entry of Object.values(this.inventory)) {
        // Include tobaccos that are either in stock or favourited (so
        // favourites show in the Bodega view even with 0 grams).
        const inStock = (entry.grams || 0) > 0
        const isFav = !!entry.favourite
        if (!inStock && !isFav) continue
        const id = tobaccoId(entry.brand, entry.blend)
        if (seen.has(id)) continue
        seen.add(id)
        if (catMap[id]) {
          result.push(catMap[id])
        } else {
          result.push(this.stubFromEntry(entry))
        }
      }
      return result
    },
    stubFromEntry(entry: InventoryEntry): Tobacco {
      return {
        brand: entry.brand,
        blend: entry.blend,
        sizes: [],
        blend_type: entry.blend_type ?? null,
        contents: entry.contents ?? null,
        flavoring: entry.flavoring ?? null,
        cut: entry.cut ?? null,
        country: entry.country ?? null,
        strength: entry.strength ?? null,
        flavoring_profile: entry.flavoring_profile ?? null,
        room_note: entry.room_note ?? null,
        taste: entry.taste ?? null,
      }
    },
    tobaccoFromTr(entry: any): Tobacco {
      return {
        brand: entry.brand,
        blend: entry.blend,
        sizes: [],
        blend_type: entry.blend_type ?? null,
        contents: entry.contents ?? null,
        flavoring: entry.flavoring ?? null,
        cut: entry.cut ?? null,
        country: entry.country ?? null,
        strength: entry.strength ?? null,
        flavoring_profile: entry.flavoring_profile ?? null,
        room_note: entry.room_note ?? null,
        taste: entry.taste ?? null,
      }
    },
    stubTobacco(brand: string, blend: string): Tobacco {
      return this.stubFromEntry({ brand, blend, grams: 0 })
    },
    // --- Add Stock modal ---
    async openAddStockModal() {
      this.authError = ''
      this.addStockBrand = ''
      this.addStockBlend = ''
      this.addStockGrams = ''
      this.showAddStockModal = true
      await this.ensureTrLoaded()
    },
    onAddStockBrandInput() {
      // Reset blend if it no longer belongs to the selected brand
      // (keeps suggestions coherent)
      if (this.addStockBlend && !this.addStockBlendOptions.includes(this.addStockBlend)) {
        // keep user text — they may type a custom blend
      }
    },
    async saveAddStock() {
      const brand = this.addStockBrand.trim()
      const blend = this.addStockBlend.trim()
      const grams = parseInt(this.addStockGrams) || 0
      if (!brand) {
        this.authError = 'Indica un fabricante.'
        return
      }
      if (grams <= 0) {
        this.authError = 'Indica una cantidad de gramos.'
        return
      }
      try {
        const { setGramsByBrandBlend } = await import('./inventory')
        // For non-catalog tobaccos, persist the descriptive properties so the
        // card renders fully in Stock Mode without needing tr.json at runtime.
        const match = this.addStockMatch
        let properties: Record<string, any> | undefined
        if (match && match.source === 'tr') {
          const t = match.tobacco
          properties = {
            blend_type: t.blend_type,
            contents: t.contents,
            flavoring: t.flavoring,
            cut: t.cut,
            country: t.country,
            strength: t.strength,
            flavoring_profile: t.flavoring_profile,
            room_note: t.room_note,
            taste: t.taste,
          }
        }
        await setGramsByBrandBlend(brand, blend, grams, properties)
        this.showAddStockModal = false
      } catch (e: any) {
        this.authError = e?.message || 'Error al guardar'
      }
    },
    exportCSV() {
      const rows = [['Fabricante', 'Labor', 'Gramos', 'Favorito']]
      const entries = Object.values(this.inventory)
        .filter(e => e.grams > 0)
        .sort((a, b) => b.grams - a.grams)
      for (const e of entries) {
        rows.push([e.brand, e.blend || '', String(e.grams), e.favourite ? 'sí' : 'no'])
      }
      const csv = rows.map(r =>
        r.map(field => {
          const s = String(field)
          if (s.includes(',') || s.includes('"') || s.includes('\n')) {
            return '"' + s.replace(/"/g, '""') + '"'
          }
          return s
        }).join(',')
      ).join('\n')
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'mi-inventario-tabacos.csv'
      a.click()
      URL.revokeObjectURL(url)
    },
    totalGrams(): number {
      return Object.values(this.inventory).reduce((sum, e) => sum + (e.grams || 0), 0)
    },
    ownedCount(): number {
      return Object.values(this.inventory).filter(e => e.grams > 0).length
    },
    formatKg(grams: number): string {
      const kg = grams / 1000
      if (kg >= 1) {
        return `${kg.toFixed(kg >= 10 ? 0 : 1).replace('.', ',')} kg`
      }
      return `${grams} g`
    }
  },
  watch: {
    selectedRegion(newRegion, oldRegion) {
      if (newRegion !== oldRegion) {
        this.setSelectedRegion(newRegion)
      }
    }
  }
}
</script>
