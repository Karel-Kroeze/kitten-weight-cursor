import { KittenService, WeightService } from './kittenService.js';

export function createSampleData() {
  try {
    // Create sample kittens
    const mittensId = KittenService.createKitten({
      name: 'Mittens',
      birth_date: '2024-05-01',
      rescue_date: '2024-05-15',
      color: 'Orange tabby',
      sex: 'M',
      status: 'Active',
      notes: 'Very playful, loves to climb'
    });

    const shadowId = KittenService.createKitten({
      name: 'Shadow',
      birth_date: '2024-04-28',
      rescue_date: '2024-05-10',
      color: 'Black',
      sex: 'F',
      status: 'Active',
      notes: 'Shy but very sweet'
    });

    const patchesId = KittenService.createKitten({
      name: 'Patches',
      birth_date: '2024-05-03',
      rescue_date: '2024-05-20',
      color: 'Calico',
      sex: 'F',
      status: 'Adopted',
      notes: 'Beautiful calico, adopted by the Smith family'
    });

    // Create weight measurements for Mittens (showing growth)
    const today = new Date();
    const baseWeight = 85; // Starting weight in grams

    for (let i = 0; i < 10; i++) {
      const measurementDate = new Date(today);
      measurementDate.setDate(today.getDate() - (9 - i));
      
      WeightService.createWeight({
        kitten_id: mittensId,
        weight_grams: baseWeight + (i * 8) + Math.floor(Math.random() * 5), // Growth with some variation
        measurement_date: measurementDate.toISOString(),
        notes: i === 9 ? 'Looking healthy and active!' : undefined
      });
    }

    // Create weight measurements for Shadow (showing slower growth)
    for (let i = 0; i < 8; i++) {
      const measurementDate = new Date(today);
      measurementDate.setDate(today.getDate() - (7 - i));
      
      WeightService.createWeight({
        kitten_id: shadowId,
        weight_grams: 78 + (i * 6) + Math.floor(Math.random() * 3), // Slower growth
        measurement_date: measurementDate.toISOString(),
        notes: i === 0 ? 'Small when found, gaining slowly' : undefined
      });
    }

    // Create a couple measurements for Patches before adoption
    WeightService.createWeight({
      kitten_id: patchesId,
      weight_grams: 145,
      measurement_date: new Date(2024, 4, 25).toISOString(), // May 25, 2024
      notes: 'Ready for adoption!'
    });

    WeightService.createWeight({
      kitten_id: patchesId,
      weight_grams: 162,
      measurement_date: new Date(2024, 5, 1).toISOString(), // June 1, 2024
      notes: 'Final weigh-in before going to new home'
    });

    console.log('Sample data created successfully!');
    console.log(`Created ${KittenService.getAllKittens().length} kittens with weight data`);
  } catch (error) {
    console.error('Error creating sample data:', error);
  }
}

// Function to clear all data (for testing)
export function clearAllData() {
  try {
    const kittens = KittenService.getAllKittens();
    kittens.forEach(kitten => {
      if (kitten.id) {
        KittenService.deleteKitten(kitten.id);
      }
    });
    console.log('All data cleared successfully!');
  } catch (error) {
    console.error('Error clearing data:', error);
  }
}