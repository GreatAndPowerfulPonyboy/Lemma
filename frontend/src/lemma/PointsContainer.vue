<script setup lang = "ts">
import {computed, ref} from 'vue';
import {api} from "../api/client.ts";
import Menu from "../reusable/ui/Menu.vue";
import {useHome, type MyPoint} from "./useLemma.ts";
import PointCard from "./PointCard.vue";
defineProps<{points: MyPoint[]}>();
</script>

<template>
  <section v-if="points.length" class="points">
    <div>
      <ul>
        <li v-for="point in points" :key="point.cue">
          <PointCard :row="point"></PointCard>
        </li>
      </ul>
    </div>
  </section>
  <section v-else>
    <h4>Add A point!</h4>
  </section>
</template>
