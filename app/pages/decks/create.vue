<template>
    <div class="p-6 max-w-3xl mx-auto">
        <UCard>
            <h1 class="text-2xl font-bold mb-4">Create a New Deck</h1>

            <!-- Add the :state="deckRef" prop here -->
            <UForm :state="deckRef" @submit="handleSubmit">
                <!-- Deck Name -->
                <UFormItem label="Deck Name" name="name" required> <!-- Added name="name" for validation -->
                    <UInput v-model="deckRef.name" placeholder="Enter the name of the deck" required />
                </UFormItem>

                <!-- Deck Description -->
                <UFormItem label="Description" name="description"> <!-- Added name="description" -->
                    <UTextarea v-model="deckRef.description" placeholder="Enter a description for the deck" :rows="3" /> <!-- Changed rows="3" to :rows="3" -->
                </UFormItem>

                <!-- Submit Button -->
                <div class="mt-6">
                    <UButton type="submit" label="Create Deck" size="sm" variant="outline" color="neutral"/>
                </div>
            </UForm>
        </UCard>
    </div>
</template>

<script setup>
import { reactive } from "vue";
import { Deck } from "~/model/Deck";

const deckRef = reactive({
    name: "",
    description: "",
});

function handleSubmit() {
    if (!deckRef.name) {
        console.error("Validation Error: Deck name is required.");
        const toast = useToast()
        toast.add({ title: 'Error', description: 'Deck name is required.', color: 'red' })
        return;
    }

    const id = Date.now().toString(); // Generate a simple unique ID

    // Create a new Deck instance (assuming Deck class exists)
    const deck = new Deck(id, deckRef.name, deckRef.description, [], []);
    console.log("Deck to be created:\n", deck.toString());


    // Reset the form after successful submission
    deckRef.name = "";
    deckRef.description = "";

    // Optionally provide success feedback
    const toast = useToast()
    toast.add({ title: 'Success', description: 'Deck created!', color: 'green' })

    // Optionally navigate away
    // const router = useRouter()
    // router.push('/decks');
}
</script>