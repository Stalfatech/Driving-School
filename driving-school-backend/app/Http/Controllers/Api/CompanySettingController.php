<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CompanySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class CompanySettingController extends Controller
{
    public function index()
    {
        try {
            $settings = CompanySetting::first();
            
            // 🔥 FIX: Just return a new, empty model instead of forcing an empty DB insert
            if (!$settings) {
                $settings = new CompanySetting();
            }
            
            return response()->json(['success' => true, 'data' => $settings]);
            
        } catch (\Exception $e) {
            Log::error('Company Settings Index Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to load settings.'], 500);
        }
    }

    public function update(Request $request)
    {
        try {
            // Find the existing row, or create a new empty model instance in memory
            $settings = CompanySetting::first();
            if (!$settings) {
                $settings = new CompanySetting();
            }

            $validated = $request->validate([
                'company_name' => 'nullable|string|max:255',
                'company_address' => 'nullable|string',
                'company_city' => 'nullable|string|max:100',
                'company_province' => 'nullable|string|max:100',
                'company_postal_code' => 'nullable|string|max:20',
                'company_email' => 'nullable|email|max:255',
                'company_phone' => 'nullable|string|max:20',
                'payment_instructions' => 'nullable|string',
                'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048'
            ]);

            // Handle the logo upload safely
            if ($request->hasFile('company_logo')) {
                if ($settings->company_logo) {
                    Storage::disk('public')->delete($settings->company_logo);
                }
                $path = $request->file('company_logo')->store('company', 'public');
                $validated['company_logo'] = $path;
            }

            // 🔥 FIX: Use fill() and save() so it works perfectly whether the row is new or old
            $settings->fill($validated);
            $settings->save();

            return response()->json([
                'success' => true,
                'message' => 'Company settings updated successfully',
                'data' => $settings
            ]);

        } catch (\Exception $e) {
            Log::error('Company Settings Update Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Failed to save settings.'], 500);
        }
    }
}