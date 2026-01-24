set -e

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <iterations> <prd-file> Example: $0 5 phase1.prd.json"
  exit 1
fi

for ((i=1; i <= $1; i++)); do
  echo "Iteration $i"
  echo
  result=$(claude --dangerously-skip-permissions "@$2 @progress.txt \
1. Find the highest-priority feature to work on and work only on that feature. This should be the one YOU decide has the highest priority - not necessarily the first:
2. Check that the types check via pnpm typecheck and that the tests pass via pnpm test. If there are test failures, fix them as part of the feature work.
3. Update $2 with the work that was done by setting the passes property to true if the feature passes all tests. \
4. Append your progress to the progress.txt file. Use this to leave a note for the next person working in the codebase. \
5. Make a git commit of that feature. ONLY WORK ON A SINGLE FEATURE. If, while implementing the feature, you notice the PRD is complete, output <promise>COMPLETE</promise> and stop working. \
" | tee /dev/tty)

  if [[ "$result" == *"<promise>COMPLETE</promise>"* ]]; then
  echo "PRD complete, exiting."
  echo "exit"
  exit 0
  fi
done
