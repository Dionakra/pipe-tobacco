<template>
  <header class="">
    <h1 class="text-3xl text-center font-bold text-gris py-2">Precios de tabacos de pipa vendidos en España</h1>

    <!-- FILTERS -->
    <div class="flex bg-white w-full flex-wrap md:flex-inline justify-center">
      <div class="w-full">
        <!-- REGION -->
        <div class="flex gap-4 justify-center mb-2">
          <div @click="setSelectedRegion('pb')" :class="{ 'bg-yellow-100': selectedRegion == 'pb' }"
            class="cursor-pointer hover:bg-yellow-100 rounded-md shadow-sm hover:shadow-lg border border-gray-300 px-2 py-1">
            Península e Illes Balears
          </div>
          <div @click="setSelectedRegion('cm')" :class="{ 'bg-yellow-100': selectedRegion == 'cm' }"
            class="cursor-pointer hover:bg-yellow-100 rounded-md shadow-sm hover:shadow-lg border border-gray-300 px-2 py-1">
            Ceuta y Melilla
          </div>
        </div>
        <!-- END REGION -->
        <!-- BRAND, BLEND AND SIZE -->
        <div class="flex flex-wrap gap-2 justify-center mb-2">
          <select aria-label="Fabricante" v-model="selectedBrand" class="px-2 py-1 border border-gray-300 rounded-md"
            :class="selectedBrand == '' ? 'text-gray-500' : 'text-gray-900'">
            <option value="" class="text-gray-500">Fabricante</option>
            <option class="text-gray-900" v-for="brand in brands" :key="brand" :value="brand">{{ brand }}</option>
          </select>

          <select aria-label="Labor" v-model="selectedBlend" class="px-2 py-1 border border-gray-300 rounded-md"
            :class="selectedBlend == '' ? 'text-gray-500' : 'text-gray-900'">
            <option value="" class="text-gray-500">Labor</option>
            <option class="text-gray-900" v-for="blend in blends" :key="blend" :value="blend">{{ blend }}</option>
          </select>

          <select aria-label="Tamaño" v-model="selectedSize" class="px-2 py-1 border border-gray-300 rounded-md"
            :class="selectedSize == 0 ? 'text-gray-500' : 'text-gray-900'">
            <option value="0" class="text-gray-500">Tamaño</option>
            <option class="text-gray-900" v-for="size in sizes" :key="size" :value="size">{{ size }} g</option>
          </select>
        </div>
        <!-- END BRAND, BLEND AND SIZE -->
        <!-- SORT -->
        <div class="flex flex-wrap gap-2 justify-center">
          <div @click="sort = ''" :class="{ 'bg-yellow-100': sort == '' }"
            class="cursor-pointer hover:bg-yellow-100 rounded-md shadow-sm hover:shadow-lg border border-gray-300 px-2 py-1">
            Act. Reciente
          </div>
          <div @click="sort = 'ascKg'" :class="{ 'bg-yellow-100': sort == 'ascKg' }"
            class="cursor-pointer hover:bg-yellow-100 rounded-md shadow-sm hover:shadow-lg border border-gray-300 px-2 py-1">
            Más baratos (kg)
          </div>
          <div @click="sort = 'descKg'" :class="{ 'bg-yellow-100': sort == 'descKg' }"
            class="cursor-pointer hover:bg-yellow-100 rounded-md shadow-sm hover:shadow-lg border border-gray-300 px-2 py-1">
            Más caros (kg)
          </div>
          <div @click="sort = 'asc'" :class="{ 'bg-yellow-100': sort == 'asc' }"
            class="cursor-pointer hover:bg-yellow-100 rounded-md shadow-sm hover:shadow-lg border border-gray-300 px-2 py-1">
            Más baratos
          </div>
          <div @click="sort = 'desc'" :class="{ 'bg-yellow-100': sort == 'desc' }"
            class="cursor-pointer hover:bg-yellow-100 rounded-md shadow-sm hover:shadow-lg border border-gray-300 px-2 py-1">
            Más caros
          </div>
        </div>
        <!-- END SORT -->
      </div>
    </div>
    <!-- END FILTERS -->
  </header>

  <!-- TOBACCOS -->
  <main class="container mx-auto">
    <div class="flex flex-wrap ">

      <div class="w-1/2 md:w-1/3 xl:w-1/6" v-for="tobacco in pageContent()">
        <div @click="selectedTobacco = tobacco"
          class="cursor-pointer rounded shadow-md border border-gray-100 hover:-translate-y-1 transition transform hover:shadow-lg m-2">
          <div class="p-2">
            <p class="pl-1 text-xl" v-html="tobacco.brand"></p>
            <p class="pl-2 text-gray-600 " v-html="tobacco.blend"></p>

            <div class="w-full grid grid-cols-2" v-for="size in tobacco.sizes.sort((a, b) => a.grams - b.grams)">
              <div class="flex my-auto gap-2 px-2">
                <img src="/size.svg" class="h-6 my-auto"> <span class="my-auto"> {{ size.grams }} g</span>
              </div>
              <div class="flex my-auto gap-2 pl-2">
                <img src="/price.svg" class="h-5 my-auto"> <span class="my-auto "> {{
                  size.currentPrice.toFixed(2) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE EDICION-->
    <div v-if="selectedTobacco" class="relative z-10">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75"></div>

      <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div
            class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="">
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 class="text-xl leading-6 text-gray-900" id="modal-title">
                    <span class="font-semibold">{{ selectedTobacco.brand }} {{
                      selectedTobacco.blend }}</span>
                  </h3>
                  <div v-for="size in selectedTobacco.sizes.sort((a, b) => a.grams - b.grams)">
                    <div class="flex my-auto  px-2 font-bold py-2">
                      <img src="/size.svg" class="h-6 my-auto"> <span class="my-auto pl-2"> {{ size.grams }}
                        g</span>
                    </div>
                    <div class=" px-2 gap-2 justify-start grid grid-cols-2 grid-flow-col auto-cols-max"
                      v-for="price in size.priceHistory">
                      <div class="flex my-auto pl-2">
                        <img src="/calendar.svg" class="h-6"> <span class="my-auto text-lg pl-2"> {{ price.date }}
                        </span>
                      </div>
                      <div class="flex my-auto">
                        <img src="/price.svg" class="h-6"> <span class="my-auto text-lg pl-2"> {{
                          price.price.toFixed(2) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button type="button" @click="selectedTobacco = undefined"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold
                text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
  <!-- END TOBACCOS -->
</template>

<script lang="ts">
import { Tobacco } from '../lib/models/Tobacco'
const ITEMS_PER_PAGE = 3000

export default {
  data() {
    const data: {
      tobaccos: Tobacco[],
      brands: string[],
      selectedBrand: string,
      selectedBlend: string,
      selectedSize: number,
      loaded: boolean,
      totalPages: number,
      currentPage: number,
      selectedRegion: string,
      selectedTobacco?: Tobacco,
      sort: string
    } = {
      tobaccos: [],
      brands: [],
      loaded: false,
      totalPages: 0,
      currentPage: 1,
      selectedBrand: "",
      selectedBlend: "",
      selectedSize: 0,
      selectedRegion: "",
      selectedTobacco: undefined,
      sort: ""
    }
    return data
  },
  created() {
    this.retrieveSelectedRegion()
    this.fetchTobaccos()
  },
  computed: {
    blends(): string[] {
      if (this.selectedBrand == "") {
        return []
      }
      return this.tobaccos.filter(t => {
        let res = true
        if (this.selectedBrand != "") {
          res = this.selectedBrand == t.brand
        }
        if (res && this.selectedSize != 0) {
          res = t.sizes.find(s => s.grams == this.selectedSize) != undefined
        }
        return res
      })
        .map(t => t.blend)
        .filter(b => b.length > 0)
        .sort()
    },
    sizes(): number[] {
      const sizes = this.tobaccos.filter(t => {
        let res = true
        if (this.selectedBrand != "") {
          res = this.selectedBrand == t.brand
        }
        if (res && this.selectedBrand != "") {
          res = t.blend == this.selectedBlend
        }
        return res
      })
        .flatMap(t => t.sizes.map(s => s.grams))
        .filter(s => s > 0)
        .sort((a, b) => a - b)
      return [...new Set(sizes)]
    }
  },
  methods: {
    fetchTobaccos() {
      fetch(`https://raw.githubusercontent.com/Dionakra/pipe-tobacco/refs/heads/main/public/${this.selectedRegion}.json`)
        .then((response) => response.json())
        .then((data) => {
          this.tobaccos = data
          this.loaded = true
          this.brands = this.tobaccos.map(t => t.brand).sort()
          this.brands = [...new Set(this.brands)]
        })
    },
    retrieveSelectedRegion() {
      let region = localStorage.getItem("REGION")
      if (region == null || !['pb', 'cm'].includes(region)) {
        region = 'pb'
      }
      this.setSelectedRegion(region)
    },
    setSelectedRegion(region: string) {
      this.selectedRegion = region
      localStorage.setItem("REGION", region)
      this.resetPage()
    },
    resetPage() {
      this.currentPage = 1
    },
    pageContent(): Tobacco[] {
      const tobaccos = this.filterTobaccos()
      this.totalPages = Math.floor(tobaccos.length / ITEMS_PER_PAGE) + 1
      return tobaccos.slice((this.currentPage - 1) * ITEMS_PER_PAGE, this.currentPage * ITEMS_PER_PAGE)
    },
    filterTobaccos(): Tobacco[] {
      let filteredTobaccos = this.tobaccos
        .filter(t => {
          let res = true
          if (this.selectedBrand != "") {
            res = t.brand == this.selectedBrand
          }
          if (res && this.selectedBlend != "") {
            res = t.blend == this.selectedBlend
          }

          if (res && this.selectedSize > 0) {
            res = t.sizes.find(s => s.grams == this.selectedSize) != undefined
          }

          return res
        })

      if (this.sort != "") {
        filteredTobaccos = filteredTobaccos.sort((a, b) => {
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
    }
  },
  watch: {
    selectedRegion(newRegion, oldRegion) {
      this.setSelectedRegion(newRegion)
      this.fetchTobaccos()

    }
  }
}
</script>
