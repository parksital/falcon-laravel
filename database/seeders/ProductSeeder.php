<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Photo booth',
                'description' => 'Open-air booth with instant prints and themed props.',
            ],
            [
                'name' => 'Foldable chairs',
                'description' => 'White resin chairs with setup and breakdown included.',
            ],
            [
                'name' => 'Entertainment',
                'description' => 'DJ package with sound system and MC services.',
            ],
            [
                'name' => 'Catering',
                'description' => 'Buffet-style menu with custom dietary options.',
            ],
            [
                'name' => 'Lighting package',
                'description' => 'Uplighting and spotlighting to match your theme.',
            ],
            [
                'name' => 'Event staffing',
                'description' => 'Servers and on-site coordinator for smooth service.',
            ],
            [
                'name' => 'Stage rental',
                'description' => 'Modular stage sections with safety rails.',
            ],
            [
                'name' => 'Linen & tableware',
                'description' => 'Tablecloths, napkins, and table settings.',
            ],
            [
                'name' => 'Backdrop & decor',
                'description' => 'Custom backdrop installation with floral accents.',
            ],
            [
                'name' => 'Portable heaters',
                'description' => 'Outdoor heaters for cooler evenings.',
            ],
        ];

        foreach ($products as $product) {
            Product::updateOrCreate(
                ['name' => $product['name']],
                $product
            );
        }
    }
}
