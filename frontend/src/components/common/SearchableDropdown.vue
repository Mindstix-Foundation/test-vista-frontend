<template>
  <div class="form-floating dropdown">
    <input
      type="text"
      class="form-control"
      :id="id"
      :placeholder="placeholder"
      v-model="searchText"
      @input="handleInput"
      @focus="showDropdown = true"
      @click="showDropdown = true"
      autocomplete="off"
      required
      :disabled="disabled"
      @keydown="handleKeydown"
    />
    <div
      class="dropdown-menu"
      :class="{ show: showDropdown && filteredItems.length > 0 }"
      style="position: absolute; width: 100%; z-index: 1000"
    >
      <button
        v-for="(item, index) in filteredItems"
        :key="getItemKey(item)"
        class="dropdown-item"
        :class="{ active: index === selectedIndex }"
        @click="selectItem(item)"
        type="button"
      >
        <slot name="item" :item="item">
          {{ getItemLabel(item) }}
        </slot>
      </button>
    </div>
    <label :for="id">{{ label }} <span v-if="required" class="text-danger">*</span></label>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

interface Item {
  id: number | string
  [key: string]: unknown
}

interface Props {
  id: string
  label: string
  placeholder: string
  items: Item[]
  modelValue: Item | null
  disabled?: boolean
  required?: boolean
  labelKey?: string
  searchKeys?: string[]
  itemKey?: string
  nextFieldId?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  labelKey: 'name',
  searchKeys: () => ['name'],
  itemKey: 'id',
  nextFieldId: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Item | null): void
  (e: 'change', value: Item | null): void
}>()

const searchText = ref('')
const showDropdown = ref(false)
const selectedIndex = ref(-1)

// Watch for external value changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      searchText.value = getItemLabel(newValue)
    } else {
      searchText.value = ''
    }
  },
  { immediate: true },
)

const filteredItems = computed(() => {
  const search = searchText.value.toLowerCase()
  if (!search) return props.items

  return props.items.filter((item) => {
    return props.searchKeys.some((key) => {
      const value = getNestedValue(item, key)
      return String(value || '')
        .toLowerCase()
        .includes(search)
    })
  })
})

const getNestedValue = (obj: Record<string, unknown>, path: string): unknown => {
  let current: unknown = obj
  const keys = path.split('.')

  for (const key of keys) {
    if (current && typeof current === 'object') {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return current
}

const getItemLabel = (item: Item): string => {
  if (!item) return ''
  const value = getNestedValue(item, props.labelKey)
  return String(value || '')
}

const getItemKey = (item: Item): string | number => {
  const value = getNestedValue(item, props.itemKey)
  if (typeof value === 'string' || typeof value === 'number') {
    return value
  }
  return item.id
}

const handleInput = () => {
  showDropdown.value = true
  selectedIndex.value = -1
  emit('update:modelValue', null)
}

const handleKeydown = (event: KeyboardEvent) => {
  if (!showDropdown.value) return

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      selectedIndex.value = Math.min(selectedIndex.value + 1, filteredItems.value.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      selectedIndex.value = Math.max(selectedIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (selectedIndex.value >= 0 && filteredItems.value[selectedIndex.value]) {
        selectItem(filteredItems.value[selectedIndex.value])
      }
      break
    case 'Escape':
      event.preventDefault()
      showDropdown.value = false
      break
  }
}

const selectItem = (item: Item) => {
  emit('update:modelValue', item)
  emit('change', item)
  searchText.value = getItemLabel(item)
  showDropdown.value = false
  selectedIndex.value = -1

  // Move focus to next field
  nextTick(() => {
    if (props.nextFieldId) {
      // If nextFieldId is specified, try to focus that element
      const nextElement = document.getElementById(props.nextFieldId)
      if (nextElement && !nextElement.hasAttribute('disabled')) {
        nextElement.focus()
        // Trigger click to open dropdown if it's our searchable dropdown
        if (nextElement.classList.contains('form-control')) {
          nextElement.click()
        }
      }
    } else {
      // Fall back to default tab order behavior
      const currentInput = document.getElementById(props.id)
      if (currentInput) {
        const allFocusable = Array.from(
          document.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
          ),
        )
        const currentIndex = allFocusable.indexOf(currentInput)
        if (currentIndex > -1 && currentIndex < allFocusable.length - 1) {
          const nextElement = allFocusable[currentIndex + 1] as HTMLElement
          nextElement.focus()
        }
      }
    }
  })
}

// Expose method to clear selection
defineExpose({
  clear: () => {
    searchText.value = ''
    emit('update:modelValue', null)
    selectedIndex.value = -1
  },
})
</script>

<style scoped>
.dropdown-menu {
  max-height: 200px;
  overflow-y: auto;
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.15);
  padding: 0.5rem 0;
}

.dropdown-item {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  display: block;
  color: #212529;
}

.dropdown-item:hover,
.dropdown-item.active {
  background-color: #212529;
  color: #fff;
}

.form-floating > .form-control {
  height: calc(3.5rem + 2px);
  line-height: 1.25;
}

.form-floating > label {
  padding: 1rem 0.75rem;
}
</style>
