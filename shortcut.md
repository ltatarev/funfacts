# iOS Shortcut: Add fact

This Shortcut creates a GitHub issue that the `add-fact` workflow
(`.github/workflows/add-fact.yml`) turns into an entry in `data/facts.json`.

## 1. Make a token

Go to GitHub → Settings → Developer settings → Fine-grained tokens →
Generate new token. Scope it to the `ltatarev/funfacts` repository only.
Grant Issues: Read and write. Copy the token.

## 2. Create the Shortcut

Open the Shortcuts app on your iPhone. Tap `+` to make a new shortcut, and
add these actions in order:

1. **Ask for Input** (Text) — prompt: "Article URL". Enable "Get URLs from
   Input" if you want it pre-filled from a Share Sheet.
2. **Ask for Input** (Text) — prompt: "Fact".
3. **Ask for Input** (Text) — prompt: "Tags" (comma-separated, e.g.
   `space, history`).
4. **Text** action — build the issue body in this exact form (the parser
   needs the blank line after each heading):

   ```
   ### Article URL

   [Provided Input from step 1]

   ### Fact

   [Provided Input from step 2]

   ### Tags

   [Provided Input from step 3]
   ```

5. **Get Contents of URL**:
   - URL: `https://api.github.com/repos/ltatarev/funfacts/issues`
   - Method: `POST`
   - Headers:
     - `Authorization`: `Bearer YOUR_TOKEN`
     - `Accept`: `application/vnd.github+json`
   - Request Body: JSON, with these fields:
     - `title`: any string, e.g. "New fact"
     - `body`: the Text output from step 4
     - `labels`: an array containing `fact`

## 3. Name and save it

Name the shortcut "Add fact" and add it to your Home Screen or Share Sheet
for quick access.

## 4. Test it

Run the Shortcut with a real URL, fact, and a valid tag from the list
(`space, history, biology, language, food, technology, psychology,
geography, music, sport, medicine, oddities`). Check the GitHub Actions tab
in the repo — the `add-fact` workflow runs, commits to `data/facts.json`,
and redeploys the site.

## Constraint

The workflow only fires when the issue author matches the repo owner
(`github.event.issue.user.login == github.repository_owner`). The token
must belong to your own `ltatarev` account, not a bot or app token.

## Fixing a rejected fact

The workflow comments on the issue when it rejects a submission, and it adds
the `needs-attention` label. There are three ways to run it again:

1. Edit the issue body to correct the field the comment names. Each edit
   starts a new run.
2. Add the `fact` label to an issue that does not have it.
3. Run the workflow by hand: Actions → Add fact → Run workflow, then give
   the issue number.

The `Tags` field must use the tags in `data/tags.json`: space, history,
biology, language, food, technology, psychology, geography, music, sport,
medicine, oddities. The workflow rejects any other tag.
