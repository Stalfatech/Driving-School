<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Validator;


class EmailTemplateController extends Controller
{
    // 1. Get all templates (For Admin Dashboard)
    
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => EmailTemplate::all()
        ]);
    }

    // 2. Add a new template (Initial data creation via API)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string', // Human name like "Welcome Mail"
            'subject' => 'required|string',
            'email_body' => 'required|string',
            'sms_body' => 'nullable|string',
            'placeholders' => 'nullable|string', // Hint: "{name}, {balance}"
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create the slug automatically (Welcome Mail -> welcome_mail)
        $slug = Str::slug($request->name, '_');

        $template = EmailTemplate::create([
            'slug' => $slug,
            'subject' => $request->subject,
            'email_body' => $request->email_body,
            'sms_body' => $request->sms_body,
            'placeholders' => $request->placeholders
        ]);

        return response()->json(['success' => true, 'data' => $template], 201);
    }

    // 3. Update an existing template (Make it editable)
    public function update(Request $request, $id)
    {
        $template = EmailTemplate::find($id);
        if (!$template) return response()->json(['message' => 'Not Found'], 404);

        $template->update($request->only(['subject', 'email_body', 'sms_body']));

        return response()->json([
            'success' => true,
            'message' => 'Template updated by Admin!',
            'data' => $template
        ]);
    }
}