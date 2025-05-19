<template>
  <div class="form-floating">
    <template v-if="type === 'textarea'">
      <textarea
        :class="[
          'form-control',
          {
            'is-invalid': !isValid && isTouched,
            'is-valid': isValid && isTouched,
          },
        ]"
        :id="id"
        v-model="inputValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :style="{ minHeight: '100px' }"
        :autocomplete="autocomplete"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        :name="`no-autofill-${id}-${Date.now()}`"
        data-form-type="other"
        data-lpignore="true"
        @input="handleInput"
        @blur="handleBlur"
        @keydown="handleKeyDown"
      ></textarea>
    </template>
    <template v-else>
      <input
        :type="type"
        :class="[
          'form-control',
          {
            'is-invalid': !isValid && isTouched,
            'is-valid': isValid && isTouched,
          },
        ]"
        :id="id"
        v-model="inputValue"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
        :name="`no-autofill-${id}-${Date.now()}`"
        data-form-type="other"
        data-lpignore="true"
        @input="handleInput"
        @blur="handleBlur"
        @keydown="handleKeyDown"
      />
    </template>
    <label :for="id">{{ label }} <span v-if="required" class="text-danger">*</span></label>
    <div class="invalid-feedback">
      {{ errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    id: string
    label: string
    type?: 'text' | 'email' | 'tel' | 'textarea'
    modelValue: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    errorMessage?: string
    isValid?: boolean
    isTouched?: boolean
    autocomplete?: string
    nextFieldId?: string
    formatValue?: (value: string) => string
  }>(),
  {
    type: 'text',
    placeholder: '',
    required: false,
    disabled: false,
    errorMessage: 'This field is required',
    isValid: false,
    isTouched: false,
    autocomplete: 'off',
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', event: Event): void
  (e: 'blur', event: Event): void
  (e: 'validation', valid: boolean): void
}>()

const inputValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    inputValue.value = newValue
  },
)

watch(
  () => inputValue.value,
  (newValue) => {
    emit('update:modelValue', newValue)
  },
)

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  let value = target.value
  
  // If we have a format function, use it
  if (props.formatValue) {
    value = props.formatValue(value)
    inputValue.value = value
  }
  
  // If it's a textarea, auto-resize it
  if (props.type === 'textarea' && target instanceof HTMLTextAreaElement) {
    autoResizeTextarea(target)
  }
  
  emit('input', event)
}

const handleBlur = (event: Event) => {
  emit('blur', event)
}

// Helper functions to reduce complexity
const focusNextSpecificElement = (nextFieldId: string) => {
  const nextElement = document.getElementById(nextFieldId)
  if (!nextElement) return
  
  nextElement.focus()
  
  // If it's a dropdown, trigger click to show options
  if (nextElement.classList.contains('form-control')) {
    nextElement.click()
  }
}

const findAndFocusNextElement = (currentId: string) => {
  const allFocusable = Array.from(
    document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ) as HTMLElement[]
  
  const currentInput = document.getElementById(currentId)
  if (!currentInput) return
  
  const currentIndex = allFocusable.indexOf(currentInput as HTMLElement)
  const hasNextElement = currentIndex > -1 && currentIndex < allFocusable.length - 1
  
  if (hasNextElement) {
    allFocusable[currentIndex + 1].focus()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return
  
  // Always prevent default to avoid form submission
  event.preventDefault()
  
  if (props.nextFieldId) {
    focusNextSpecificElement(props.nextFieldId)
  } else {
    findAndFocusNextElement(props.id)
  }
}

const autoResizeTextarea = (element: HTMLTextAreaElement) => {
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}
</script>

<style scoped>


textarea {
  min-height: 100px;
  resize: vertical;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}
</style> 