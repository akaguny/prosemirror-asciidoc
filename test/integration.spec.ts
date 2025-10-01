/**
 * @fileoverview Integration tests for AsciiDoc parsing and serialization
 * Tests complete documents and real-world scenarios
 */

import { expect, test, describe } from "vitest"
import { defaultAsciiDocParser, defaultAsciiDocSerializer } from "../src/index.js"
import { testRoundtrip } from "./helpers.js"
import { fixtures } from "./fixtures.js"

describe("AsciiDoc Integration Tests", () => {
  describe("Complete Documents", () => {
    test("processes a complete document with multiple sections", () => {
      const input = `= Document Title

== Introduction
This is an introduction paragraph.

== Section 1
* List item 1
* List item 2
** Nested item
*** Deeply nested item

[source,javascript]
----
function example() {
  return "Hello World";
}
----

== Section 2
Some paragraph with *bold* and _italic_ text.

.Example Table
|===
|Header 1 |Header 2

|Cell 1
|Cell 2
|===

=== Subsection
> This is a quote block
> with multiple lines

'''

link:https://example.com[Example Link]`

      const parsed = defaultAsciiDocParser.parse(input)
      const serialized = defaultAsciiDocSerializer.serialize(parsed)
      const reparsed = defaultAsciiDocParser.parse(serialized)

      // Verify document structure is preserved
      expect(parsed.childCount).toBeGreaterThan(0)
      expect(reparsed.childCount).toBe(parsed.childCount)
    })

    test("handles complex nested structures", () => {
      const input = `= Nested Structures

* Level 1
** Level 2
*** Level 3
**** Level 4
***** Level 5
* Another Level 1

. Ordered 1
.. Ordered 2
... Ordered 3
.... Ordered 4
..... Ordered 5

____
Blockquote with *bold* and _italic_ and \`code\`.

* List inside blockquote
* Another item
____

[source,typescript]
----
interface Example {
  nested: {
    structures: string[];
  }
}
----`

      const parsed = defaultAsciiDocParser.parse(input)
      const serialized = defaultAsciiDocSerializer.serialize(parsed)
      const reparsed = defaultAsciiDocParser.parse(serialized)

      // Verify structure preservation
      expect(parsed.childCount).toBe(reparsed.childCount)
    })
  })

  describe("Real-world Examples", () => {
    test("processes documentation-style content", () => {
      const input = `= API Documentation
Author Name
v1.0.0

== Introduction
This document describes the API endpoints.

=== Authentication
All requests must include an \`Authorization\` header.

[source,http]
----
GET /api/v1/users
Authorization: Bearer <token>
----

== Endpoints

=== GET /users
Returns a list of users.

.Request Parameters
[cols="1,1,2"]
|===
|Name |Type |Description

|limit
|number
|Maximum number of results

|offset
|number
|Number of results to skip
|===

.Response Example
[source,json]
----
{
  "users": [
    {
      "id": 1,
      "name": "Example User"
    }
  ]
}
----`

      const parsed = defaultAsciiDocParser.parse(input)
      const serialized = defaultAsciiDocSerializer.serialize(parsed)
      
      // Verify content preservation
      expect(serialized).toContain("API Documentation")
      expect(serialized).toContain("Authorization: Bearer")
      expect(serialized).toContain("Response Example")
    })
  })

  describe("Roundtrip Tests", () => {
    test("preserves document structure through multiple roundtrips", () => {
      const input = `= Multiple Roundtrips

== Section 1
* Item 1
** Nested Item
* Item 2

[source]
----
Code block
----

== Section 2
Paragraph with *bold* and _italic_.`

      // First roundtrip
      const firstParse = defaultAsciiDocParser.parse(input)
      const firstSerialize = defaultAsciiDocSerializer.serialize(firstParse)
      
      // Second roundtrip
      const secondParse = defaultAsciiDocParser.parse(firstSerialize)
      const secondSerialize = defaultAsciiDocSerializer.serialize(secondParse)
      
      // Third roundtrip
      const thirdParse = defaultAsciiDocParser.parse(secondSerialize)
      
      // Verify structure is preserved across roundtrips
      expect(firstSerialize).toBe(secondSerialize)
      expect(firstParse.childCount).toBe(thirdParse.childCount)
    })
  })
})