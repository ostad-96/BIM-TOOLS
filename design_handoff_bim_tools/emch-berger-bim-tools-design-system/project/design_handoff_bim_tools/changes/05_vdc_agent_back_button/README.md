# 05 · VDC Agent — add back button

**Risk:** ✅ Tiny — isolated single-file change.

## What this does

The Kollisionsmatrix and Lichtraumprofil headers both have a translucent rounded-square back arrow to the left of the logo (returns to the Hub). The VDC Agent header doesn't. This change adds it, matching the other two exactly.

## Target file

`modules/vdc-tools/agent.html`

## Reference

Open `_reference.html` in this folder. The header now reads:

```
[← back] [LOGO] VDC Agent                       [MCP connected] [● Bereit] [⚙]
                BIM TOOLS · KI-ASSISTENT
```

## What to change in `agent.html`

### 1. Markup change

Find the `.banner-content` block — it currently has:

```html
<div class="banner-content">
    <a href="../../index.html" class="banner-brand">
        <img src="../../shared/assets/emch-berger-logo.gif" alt="Emch+Berger" class="banner-brand-mark">
        <div>
            <div class="banner-title">VDC Agent</div>
            <div class="banner-subtitle" id="modelLabel">BIM Tools · KI-Assistent</div>
        </div>
    </a>
    <div class="banner-actions">…</div>
</div>
```

Wrap the brand link in a new `.banner-left` flex container alongside a back button:

```html
<div class="banner-content">
    <div class="banner-left">
        <a class="back-btn" href="../../index.html" title="Zurück zum Hub" aria-label="Zurück">←</a>
        <a href="../../index.html" class="banner-brand">
            <img src="../../shared/assets/emch-berger-logo.gif" alt="Emch+Berger" class="banner-brand-mark">
            <div>
                <div class="banner-title">VDC Agent</div>
                <div class="banner-subtitle" id="modelLabel">BIM Tools · KI-Assistent</div>
            </div>
        </a>
    </div>
    <div class="banner-actions">…</div>
</div>
```

### 2. CSS change

In the inline `<style>` block at the top of the file, add these rules (next to the existing `.banner-brand` rule):

```css
.banner-left { display: flex; align-items: center; gap: 14px; }
.back-btn {
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.18);
    color: rgba(255,255,255,0.85);
    width: 34px; height: 34px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    text-decoration: none;
    transition: all 0.15s;
    flex-shrink: 0;
}
.back-btn:hover {
    background: rgba(255,255,255,0.20);
    border-color: rgba(255,255,255,0.30);
    color: #fff;
}
```

These are **the same `.back-btn` rules** as in `kollisionsmatrix.html` and `lichtraumprofil.html` — verbatim. If you want to dedupe the CSS later, lift `.back-btn` into a shared file; for now, keep it inline per tool (VDC files don't share CSS, intentionally).

## Verification

1. Open `agent.html` inside the VDC Manager. A 34 × 34 translucent rounded-square back button now sits to the left of the Emch+Berger logo.
2. Hover — background brightens to `rgba(255,255,255,0.20)`, border darkens slightly. Same hover feel as the other two tools.
3. Click — navigates to the Hub (`../../index.html`).
4. The logo + title link still works as a secondary back link (clicking the logo also returns to the Hub).
5. The chat below is untouched.

## What does NOT change

- Anything below the banner (chat area, input bar, status line, settings)
- `kollisionsmatrix.html` and `lichtraumprofil.html`
- The `gate.html` flow
- Any JS or storage logic
