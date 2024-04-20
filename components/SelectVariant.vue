<script setup lang="ts" generic="Variant extends BaseVariant & Record<string, unknown>">
import type { HTMLAttributes } from 'vue'
import type { BaseVariant } from '~/math/variants'

export interface SelectVariantHeader<HeaderKey extends string> {
  title: string
  key: HeaderKey
}

const props = defineProps<{
  class?: HTMLAttributes['class']
  headers: SelectVariantHeader<string>[]
  variants: Variant[]
}>()

const emit = defineEmits<{
  'select:variant': [variant: Variant]
}>()
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="secondary" :class="props.class">
        Варианты
      </Button>
    </PopoverTrigger>
    <PopoverContent class="max-h-[70dvh] w-full overflow-y-auto">
      <Table class="w-max">
        <TableHeader>
          <TableRow>
            <TableHead v-for="header in props.headers" :key="header.key">
              {{ header.title }}
            </TableHead>
          </TableRow>
          <TableRow
            v-for="variant in props.variants" :key="variant.order" class="cursor-pointer" tabindex="0"
            @keypress.enter.space="emit('select:variant', variant)"
            @click="emit('select:variant', variant)"
          >
            <TableCell v-for="{ key } in props.headers" :key="key">
              {{ variant[key] }}
            </TableCell>
          </TableRow>
        </TableHeader>
      </Table>
    </PopoverContent>
  </Popover>
</template>
