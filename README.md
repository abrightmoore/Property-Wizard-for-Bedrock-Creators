# Property Wizard for Bedrock Creators

View and edit Player and entity DynamicProperties in-game!
![In-game example](https://github.com/abrightmoore/Property-Wizard-for-Bedrock-Creators/blob/main/example.gif?raw=true)

## Installation and Usage
You can try this out in a test world by installing and running the supplied **.mcaddon** from the **installs** directory. The example shown above uses this build.

Once installed, look at the empty sky (not at any entity) to inspect the DynamicProperties on your own Player object. You can also look at other Entities, but you will have to create new properties using the Property Wizard before you can see anything interesting.

NOTE: Because of how Behaviour Packs are namespaced, you need to INCLUDE the Property Wizard in your own Add-On by copying the relevant code into your scripts
- Navigate to **source/twf_pw_b/scripts/twf/rpg**
- Open the example **mainrpg.js** script, copy the entire **function property_wizard_book_show()**, **function get_dynamic_property_with_default()**, **function what_entity_am_i_looking_at()**, **function new_action_form()** into your own BehaviorPack script
- Define constants **NAMESPACE** and **NS** equal to your preferred project namespace per your project.
- Provide a way to call **property_wizard_book_show()** when the player uses an item. You can see an example by tracing through 

## Release notes
### v1.00 - Alpha release
- Functional release for editing Entity and Player (self)
- Supports Text, Integer, and Boolean (true/false) Property values
- Copy and paste to 'install' into your own BehaviorPack scope

## Backlog
- Make a seperate library for drag and drop installation of the Property Wizard putting everything in one place
- Implement to a coding standard, clean up the mess.

Contact [@TheWorldFoundry](https://bsky.app/profile/theworldfoundry.com) for help and assistance on a best-effort/all-care-no-responsibility basis.
