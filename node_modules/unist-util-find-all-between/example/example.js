const remark = require('remark')
const between = require('../')

const markdown = `
# Example

**List one:**
- 1
- 2

**List two:**
- 3
- 4
- 5

# End

**List three:**
- 6
- 7
`

// Create a plugin for remark
const plugin = () => tree => {

  // `star` and `end` nodes to look for, and find between.
  const start = {
    type: 'heading',
    children: [{
      value: 'Example'
    }]
  }

  const end = {
    type: 'heading',
    children: [{
      value: 'End'
    }]
  }

  // Test for list types and paragraph types
  const test = node => node.type === 'list' || node.type === 'paragraph'

  // Get lists between `start` and `end`
  const lists = between(tree, start, end, test)

  // Store lists and their labels
  tree.children = lists

  // Return new tree
  return tree
}

remark()
  .use(plugin)
  .process(markdown)
  .then(
    result => console.log(result.toString()),
    console.error
  )

/**
 * Outputs:
 *
 * **List one:**
 *
 * - 1
 * - 2
 *
 * **List two:**
 *
 * - 3
 * - 4
 * - 5
 *
 */
