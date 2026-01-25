set -e

# Check if plan file argument is provided
if [ -z "$1" ]; then
  echo "Error: Plan file path required"
  echo ""
  echo "Usage: $0 <plan-file>"
  echo ""
  echo "Example:"
  echo "  $0 phase1.prd.json"
  echo "  $0 phase4.prd.json"
  exit 1
fi

# Check if plan file exists
if [ ! -f "$1" ]; then
  echo "Error: Plan file '$1' not found"
  exit 1
fi

claude --dangerously-skip-permissions "@$1 @progress.txt \
1. Find the highest-priority feature to work on and work only on that feature. This should be the one YOU decide has the highest priority - not necessarily the first. If you need more context about the specific feature or task you are working on, refer to multi-dashboard.prd.md. \
2. Check that the types check via pnpm typecheck and that the tests pass via pnpm test. If there are test failures, fix them as part of the feature work.
3. Update $1 with the work that was done by setting the passes property to true if the feature passes all tests. \
4. Append your progress to the progress.txt file. Use this to leave a note for the next person working in the codebase. \
5. Make a git commit of that feature. ONLY WORK ON A SINGLE FEATURE. If, while implementing the feature, you notice the PRD is complete, output <promise>COMPLETE</promise> and stop working. \
"
