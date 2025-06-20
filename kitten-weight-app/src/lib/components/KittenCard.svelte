<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { KittenWithLatestWeight } from '$lib/database.js';

  export let kitten: KittenWithLatestWeight;

  const dispatch = createEventDispatcher();

  function formatWeight(grams?: number): string {
    if (!grams) return 'No weight recorded';
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)}kg`;
    }
    return `${grams}g`;
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  function getStatusColor(status?: string): string {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Adopted': return 'text-blue-600 bg-blue-100';
      case 'Medical Hold': return 'text-yellow-600 bg-yellow-100';
      case 'Deceased': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  function getWeightChangeColor(change?: number): string {
    if (!change) return 'text-gray-600';
    return change > 0 ? 'text-green-600' : 'text-red-600';
  }

  function getWeightChangeIcon(change?: number): string {
    if (!change) return '';
    return change > 0 ? '↗️' : '↘️';
  }

  async function deleteKitten() {
    if (!confirm(`Are you sure you want to delete ${kitten.name}? This will also delete all weight measurements.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/kittens/${kitten.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete kitten');
      }

      dispatch('dataChanged');
    } catch (error) {
      alert('Failed to delete kitten: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  function calculateAge(birthDate?: string): string {
    if (!birthDate) return '';
    
    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} old`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} old`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''} old`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years !== 1 ? 's' : ''} old`;
    }
  }
</script>

<article class="border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow focus-within:ring-4 focus-within:ring-blue-300" role="article" aria-labelledby="kitten-name-{kitten.id}">
  <div class="flex justify-between items-start mb-6">
    <div class="flex-1">
      <div class="flex items-center gap-6 mb-4">
        <h3 id="kitten-name-{kitten.id}" class="text-xl font-semibold text-gray-900">{kitten.name}</h3>
        <span class="px-4 py-2 text-sm font-medium rounded-full {getStatusColor(kitten.status)}" role="status" aria-label="Status: {kitten.status}">
          {kitten.status}
        </span>
        {#if kitten.sex && kitten.sex !== 'Unknown'}
          <span class="text-base text-gray-500" aria-label="Sex: {kitten.sex === 'M' ? 'Male' : 'Female'}">
            {kitten.sex === 'M' ? '♂️ Male' : '♀️ Female'}
          </span>
        {/if}
      </div>
      
      <div class="text-base text-gray-600 space-y-3">
        {#if kitten.birth_date}
          <div aria-label="Age: {calculateAge(kitten.birth_date)}">🎂 {calculateAge(kitten.birth_date)}</div>
        {/if}
        {#if kitten.color}
          <div aria-label="Color: {kitten.color}">🎨 {kitten.color}</div>
        {/if}
        {#if kitten.rescue_date}
          <div aria-label="Rescued: {formatDate(kitten.rescue_date)}">🏠 Rescued {formatDate(kitten.rescue_date)}</div>
        {/if}
      </div>
    </div>

    <button
      on:click={deleteKitten}
      class="text-gray-400 hover:text-red-500 p-3 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-red-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
      title="Delete {kitten.name}"
      aria-label="Delete {kitten.name}"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
      </svg>
    </button>
  </div>

  <div class="bg-gray-50 rounded-xl p-6" role="region" aria-labelledby="weight-info-{kitten.id}">
    <div class="flex justify-between items-center mb-4">
      <span id="weight-info-{kitten.id}" class="text-base font-medium text-gray-700">Latest Weight</span>
      {#if kitten.latest_weight_date}
        <span class="text-sm text-gray-500" aria-label="Measured on {formatDate(kitten.latest_weight_date)}">{formatDate(kitten.latest_weight_date)}</span>
      {/if}
    </div>
    
    <div class="flex items-center gap-6">
      <span class="text-2xl font-bold text-blue-600" aria-label="Weight: {formatWeight(kitten.latest_weight)}">
        {formatWeight(kitten.latest_weight)}
      </span>
      
      {#if kitten.weight_change}
        <div class="flex items-center gap-2 text-base {getWeightChangeColor(kitten.weight_change)}" 
             aria-label="Weight change: {kitten.weight_change > 0 ? 'increased' : 'decreased'} by {Math.abs(kitten.weight_change)} grams{kitten.weight_change_days ? ` over ${kitten.weight_change_days} day${kitten.weight_change_days !== 1 ? 's' : ''}` : ''}">
          <span aria-hidden="true">{getWeightChangeIcon(kitten.weight_change)}</span>
          <span>
            {kitten.weight_change > 0 ? '+' : ''}{kitten.weight_change}g
            {#if kitten.weight_change_days}
              in {kitten.weight_change_days} day{kitten.weight_change_days !== 1 ? 's' : ''}
            {/if}
          </span>
        </div>
      {/if}
    </div>
  </div>

  {#if kitten.notes}
    <div class="mt-6 text-base text-gray-600" role="note" aria-labelledby="notes-label-{kitten.id}">
      <span id="notes-label-{kitten.id}" class="font-medium">Notes:</span> {kitten.notes}
    </div>
  {/if}
</article>