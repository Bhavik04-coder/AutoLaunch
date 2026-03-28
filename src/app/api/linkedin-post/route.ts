import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/linkedin-post
 *
 * Publishes a post to the authenticated user's LinkedIn profile
 * using the UGC Posts API.
 *
 * Supports text-only and image posts.
 *
 * Body (JSON):     { accessToken: string; content: string }
 * Body (FormData): accessToken, content, image (File)
 */
export async function POST(req: NextRequest) {
  try {
    let accessToken: string;
    let content: string;
    let imageFile: File | null = null;

    const contentType = req.headers.get('content-type') ?? '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      accessToken = formData.get('accessToken') as string;
      content = formData.get('content') as string;
      const img = formData.get('image');
      if (img && img instanceof File && img.size > 0) {
        imageFile = img;
      }
    } else {
      const body = await req.json();
      accessToken = body.accessToken;
      content = body.content;
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: 'LinkedIn access token is missing. Please reconnect LinkedIn.' },
        { status: 401 },
      );
    }
    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Post content cannot be empty.' },
        { status: 400 },
      );
    }

    // ── 1. Get the member's person URN ──────────────────────────────────────
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      const errText = await profileRes.text();
      console.error('[linkedin-post] userinfo error:', profileRes.status, errText);
      return NextResponse.json(
        {
          error:
            profileRes.status === 401
              ? 'LinkedIn token expired. Please reconnect LinkedIn from the Integrations tab.'
              : `Failed to fetch LinkedIn profile (${profileRes.status})`,
        },
        { status: profileRes.status },
      );
    }

    const profile = await profileRes.json();
    const personUrn = `urn:li:person:${profile.sub}`;

    // ── 2. If image provided, upload it via LinkedIn's image API ─────────
    let imageAsset: string | null = null;

    if (imageFile) {
      // Step 2a: Register the image upload
      const registerRes = await fetch(
        'https://api.linkedin.com/v2/assets?action=registerUpload',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registerUploadRequest: {
              recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
              owner: personUrn,
              serviceRelationships: [
                {
                  relationshipType: 'OWNER',
                  identifier: 'urn:li:userGeneratedContent',
                },
              ],
            },
          }),
        },
      );

      if (!registerRes.ok) {
        const errBody = await registerRes.text();
        console.error('[linkedin-post] register upload error:', registerRes.status, errBody);
        return NextResponse.json(
          { error: `Failed to register image upload (${registerRes.status})` },
          { status: registerRes.status },
        );
      }

      const registerData = await registerRes.json();
      const uploadUrl =
        registerData.value?.uploadMechanism?.[
          'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
        ]?.uploadUrl;
      imageAsset = registerData.value?.asset;

      if (!uploadUrl || !imageAsset) {
        return NextResponse.json(
          { error: 'LinkedIn did not return a valid upload URL.' },
          { status: 500 },
        );
      }

      // Step 2b: Upload the image binary
      const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': imageFile.type || 'image/jpeg',
        },
        body: imageBuffer,
      });

      if (!uploadRes.ok) {
        const errBody = await uploadRes.text();
        console.error('[linkedin-post] image upload error:', uploadRes.status, errBody);
        return NextResponse.json(
          { error: `Failed to upload image to LinkedIn (${uploadRes.status})` },
          { status: uploadRes.status },
        );
      }
    }

    // ── 3. Create UGC Post ──────────────────────────────────────────────────
    const shareContent: Record<string, unknown> = {
      shareCommentary: { text: content },
      shareMediaCategory: imageAsset ? 'IMAGE' : 'NONE',
    };

    if (imageAsset) {
      shareContent.media = [
        {
          status: 'READY',
          media: imageAsset,
        },
      ];
    }

    const ugcPayload = {
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': shareContent,
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const postRes = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(ugcPayload),
    });

    if (!postRes.ok) {
      const errBody = await postRes.text();
      console.error('[linkedin-post] ugcPosts error:', postRes.status, errBody);
      return NextResponse.json(
        {
          error:
            postRes.status === 403
              ? 'Posting permission denied. Make sure "Share on LinkedIn" product is enabled in your LinkedIn Developer Portal.'
              : `LinkedIn API error (${postRes.status}): ${errBody.slice(0, 200)}`,
        },
        { status: postRes.status },
      );
    }

    const result = await postRes.json();

    return NextResponse.json({
      success: true,
      postId: result.id,
      message: imageAsset
        ? 'Post with image published to LinkedIn successfully!'
        : 'Post published to LinkedIn successfully!',
    });
  } catch (err: unknown) {
    console.error('[linkedin-post] unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    );
  }
}
