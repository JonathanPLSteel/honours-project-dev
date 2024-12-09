#!/bin/bash

# Exit script on error
set -e

# Variables
HTML_FILE="dist/index.html"  # Update if your HTML output file is located elsewhere
DIST_FOLDER="dist"
PUBLIC_FOLDER="public"
MAIN_BRANCH="main"
GH_PAGES_BRANCH="gh-pages"
COMMIT_MESSAGE="Update build for deployment"

# Step 1: Build the project
echo -e "👷‍♂️ \e[1;32mBuilding the project...\e[0m"
npm run build

# Step 2: Check if the HTML file exists
if [[ ! -f "$HTML_FILE" ]]; then
    echo "Error: HTML file '$HTML_FILE' not found."
    exit 1
fi

# Step 3: Modify the HTML file
echo -e "👷‍♂️ \e[1;32mModifying HTML file to fix paths...\e[0m"
sed -i '' -E 's/href="\/([^"]*)"/href="\1"/g' "$HTML_FILE"

# # Step 4: Commit changes to the `main` branch
# echo -e "👷‍♂️ \e[1;32mCommitting changes to the main branch...\e[0m"
# git add -f $DIST_FOLDER  # Force-add the dist folder even if .gitignore excludes it
# git commit -m "$COMMIT_MESSAGE" || echo -e "⚠️ \e[1;33mNo changes to commit.\e[0m"
# git push origin $MAIN_BRANCH

# # Step 5: Switch to the `gh-pages` branch
# echo -e "👷‍♂️ \e[1;32mSwitching to the $GH_PAGES_BRANCH branch...\e[0m"
# git checkout $GH_PAGES_BRANCH

# # Step 6: Retrieve the `dist` folder from the `main` branch
# echo -e "👷‍♂️ \e[1;32mRetrieving the latest build from $MAIN_BRANCH...\e[0m"
# git checkout $MAIN_BRANCH -- $DIST_FOLDER

# # Step 7: Copy the contents of `dist` to the root of `gh-pages`
# echo -e "👷‍♂️ \e[1;32mUpdating the $GH_PAGES_BRANCH branch with the latest build...\e[0m"
# rm -rf *  # Clear all files in the `gh-pages` branch
# mv $DIST_FOLDER/* .  # Move the `dist` contents to the root of the branch
# rm -rf $DIST_FOLDER  # Remove the now-empty `dist` folder
# git add .

# # Step 8: Commit and push the changes to `gh-pages`
# echo -e "👷‍♂️ \e[1;32mCommitting and pushing changes to the $GH_PAGES_BRANCH branch...\e[0m"
# git commit -m "$COMMIT_MESSAGE"
# git push origin $GH_PAGES_BRANCH

# # Step 9: Switch back to the `main` branch
# echo -e "👷‍♂️ \e[1;32mSwitching back to the $MAIN_BRANCH branch...\e[0m"
# git checkout $MAIN_BRANCH

# echo -e "👷‍♂️ \e[1;34mDeployment complete!\e[0m"