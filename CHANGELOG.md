<a name="0.7.1"></a>
## 0.7.1 (2017-12-19)

* Fix: Drawing buttons styling (#82) ([bda13b8](https://github.com/box/box-annotations/commit/bda13b8))
* Fix: Ensure drawing dialog is setup on first save (#81) ([16d7c8d](https://github.com/box/box-annotations/commit/16d7c8d))
* Fix: set textarea.placeholder when generating dialogs (#74) ([5f35ac6](https://github.com/box/box-annotations/commit/5f35ac6))
* Fix: Show the appropriate buttons in mobile create highlight dialog (#75) ([05dba16](https://github.com/box/box-annotations/commit/05dba16))
* Chore: Enforce Lato font for annotation dialogs (#76) ([1e92025](https://github.com/box/box-annotations/commit/1e92025))
* Chore: Now respect newline and symbols (#73) ([41aad68](https://github.com/box/box-annotations/commit/41aad68))



<a name="0.7.0"></a>
# 0.7.0 (2017-12-12)

*  New: Generate webpack build for annotations.js/css (#59) ([0b6e44d](https://github.com/box/box-annotations/commit/0b6e44d))
* Update release.sh ([02baf38](https://github.com/box/box-annotations/commit/02baf38))
* Fix: BoxAnnotations module export (#66) ([443dcbe](https://github.com/box/box-annotations/commit/443dcbe))
* Fix: Don't add text areas without canAnnotate permissions (#62) ([9d1db9e](https://github.com/box/box-annotations/commit/9d1db9e))
* Fix: Enable drawingSelection & highlightMouseMove handlers for read-only permissions (#61) ([33bda6a](https://github.com/box/box-annotations/commit/33bda6a))
* Fix: Ensure annotation layer is before point annotations (#63) ([8e0f27b](https://github.com/box/box-annotations/commit/8e0f27b))
* Fix: Ensure mobile header doesn't get hidden when keyboard hides (#69) ([e5a1749](https://github.com/box/box-annotations/commit/e5a1749))
* Fix: Scroll to bottom of mobile dialogs (#70) ([7a33849](https://github.com/box/box-annotations/commit/7a33849))
* Fix: Use correct build script in publish.sh (#64) ([4e8fe9d](https://github.com/box/box-annotations/commit/4e8fe9d))
* New: Allow BoxAnnotations to be instantiated independently and passed into Preview as an option (#68 ([8c1637a](https://github.com/box/box-annotations/commit/8c1637a))
* Chore: Ignore proper files in .ignore files (#67) ([36606cc](https://github.com/box/box-annotations/commit/36606cc))
* Update: Exporting BoxAnnotations correctly in npm package (#65) ([f501edc](https://github.com/box/box-annotations/commit/f501edc))



<a name="0.6.0"></a>
# 0.6.0 (2017-12-05)

* Update: packages (#60) ([dbb1b79](https://github.com/box/box-annotations/commit/dbb1b79))
* Create .vscode/settings.json ([df9fb5d](https://github.com/box/box-annotations/commit/df9fb5d))
* Create ISSUE_TEMPLATE.md ([e4334fc](https://github.com/box/box-annotations/commit/e4334fc))
* Update CONTRIBUTING.md ([f340c37](https://github.com/box/box-annotations/commit/f340c37))
* Update README.md ([4d53d04](https://github.com/box/box-annotations/commit/4d53d04))
* Fix: Clarify separation between plain and comment highlights (#58) ([496ceec](https://github.com/box/box-annotations/commit/496ceec))
* Fix: Don't collapse dialog text area when a comment is deleted (#53) ([f7fbad0](https://github.com/box/box-annotations/commit/f7fbad0))
* Fix: Ensure point annotations are set up even when highlights are disabled (#57) ([93681b5](https://github.com/box/box-annotations/commit/93681b5))
* Fix: Iterate through dialog buttons NodeList in an IE compatible way (#54) ([789d78b](https://github.com/box/box-annotations/commit/789d78b))
* Fix: Publish script to reset to latest tag instead of to master (#55) ([182233a](https://github.com/box/box-annotations/commit/182233a))
* Fix: Scrolling to bottom of flipped dialogs (#56) ([89b50e2](https://github.com/box/box-annotations/commit/89b50e2))
* Chore: Remove redundant point dialog positioning (#52) ([ce3538a](https://github.com/box/box-annotations/commit/ce3538a))
* Chore: Renaming annotator classes names to be more generic (#51) ([21cc74c](https://github.com/box/box-annotations/commit/21cc74c))



<a name="0.5.0"></a>
# 0.5.0 (2017-11-27)

* Chore: Disable dialog actions until annotation is saved on the server (#48) ([6dbcda2](https://github.com/box/box-annotations/commit/6dbcda2))
* Chore: Remove autobind from base classes (#44) ([639f8d2](https://github.com/box/box-annotations/commit/639f8d2))
* Chore: Remove autobind from doc classes (#46) ([d7ded88](https://github.com/box/box-annotations/commit/d7ded88))
* Chore: Remove autobind from Image classes (#45) ([1dda3a4](https://github.com/box/box-annotations/commit/1dda3a4))
* Chore: Remove NPM install from release/publish scripts (#50) ([48822c4](https://github.com/box/box-annotations/commit/48822c4))
* Update: Remaining packages (#49) ([4dab273](https://github.com/box/box-annotations/commit/4dab273))
*  Update: Sinon to v4.1.2 & remove autobind-decorator (#47) ([eea7dcf](https://github.com/box/box-annotations/commit/eea7dcf))



<a name="0.4.0"></a>
# 0.4.0 (2017-11-21)

* Chore: Cleanup annotations permissions (#40) ([a52ed54](https://github.com/box/box-annotations/commit/a52ed54))
* Fix: Activate annotation dialog on post (#42) ([bc001be](https://github.com/box/box-annotations/commit/bc001be))
* Fix: Disable highlight creation when the mobile shared dialog is visible (#35) ([de7f392](https://github.com/box/box-annotations/commit/de7f392))
* Fix: Don't clear reply textarea when annotation is added to dialog (#36) ([1f88d55](https://github.com/box/box-annotations/commit/1f88d55))
* Fix: Ensure commentbox event listeners are bound properly (#37) ([fcce638](https://github.com/box/box-annotations/commit/fcce638))
* Fix: Prevent creation of highlights when a point annotation is pending (#41) ([42e29ce](https://github.com/box/box-annotations/commit/42e29ce))
* Fix: Validate pendingThreadID when calling onSelectionChange() (#39) ([10c1c98](https://github.com/box/box-annotations/commit/10c1c98))
* Update: packages (#43) ([97a91c3](https://github.com/box/box-annotations/commit/97a91c3))
*  Fix: Ensure newly created threads are set as inactive while saving (#38) ([8072fa8](https://github.com/box/box-annotations/commit/8072fa8))



<a name="0.3.0"></a>
# 0.3.0 (2017-11-14)

* Chore: Add conventional-changelog-releaser (#34) ([624e0bd](https://github.com/box/box-annotations/commit/624e0bd))
* Chore: Do not clear out node_modules on when publishing npm package (#30) ([08c180d](https://github.com/box/box-annotations/commit/08c180d))
* Fix: Do not select drawings when creating a point annotation on top (#28) ([07fc4c1](https://github.com/box/box-annotations/commit/07fc4c1))
* Fix: Drawing CSS (#23) ([0493fcd](https://github.com/box/box-annotations/commit/0493fcd))
* Fix: fix highlight selection and typos (#21) ([ca54d5e](https://github.com/box/box-annotations/commit/ca54d5e)), closes [#21](https://github.com/box/box-annotations/issues/21)
* Fix: Hide createHighlightDialog on page re-render (#31) ([0b74717](https://github.com/box/box-annotations/commit/0b74717))
* Fix: Match width of reply textarea with comments (#33) ([5f0f29b](https://github.com/box/box-annotations/commit/5f0f29b))
* Fix: Only registering thread with controller on save (#22) ([ff75bf1](https://github.com/box/box-annotations/commit/ff75bf1))
* Fix: Only show create dialog when creating new point annotations (#29) ([4822ece](https://github.com/box/box-annotations/commit/4822ece))
* Fix: only show newly created annotation dialog on hover (#25) ([0ba1965](https://github.com/box/box-annotations/commit/0ba1965))
* Fix: Position create dialog properly near page edges (#32) ([968efb3](https://github.com/box/box-annotations/commit/968efb3))
* Fix: release script should use correct remote branch (#20) ([8bd12a5](https://github.com/box/box-annotations/commit/8bd12a5))
* Fix: Scrolling on highlight dialogs in powerpoints (#24) ([b21ed0e](https://github.com/box/box-annotations/commit/b21ed0e))
* Fix: Validation message fails to get displayed when user clicks on 'Post' without entering any comme ([d90e72c](https://github.com/box/box-annotations/commit/d90e72c))
*  Fix: Hide mobile dialog on first outside click (#26) ([01ec48b](https://github.com/box/box-annotations/commit/01ec48b))



<a name="0.2.0"></a>
# 0.2.0 (2017-11-08)

* Chore: Cleaning up mobile phone drawing CSS (#17) ([b125b8b](https://github.com/box/box-annotations/commit/b125b8b))
* Chore: Move controllers into a separate folder (#18) ([3efa19f](https://github.com/box/box-annotations/commit/3efa19f))
* Chore: Paging draw threads in the controller's internal thread map (#6) ([fc52e9e](https://github.com/box/box-annotations/commit/fc52e9e))
* Chore: Refactoring annotation mode logic into controllers (#15) ([2be6ba3](https://github.com/box/box-annotations/commit/2be6ba3))
* Chore: Separate fetching and rendering of annotations (#16) ([328681e](https://github.com/box/box-annotations/commit/328681e))
*  Chore: Store threads.annotations as an object by annotationID (#5) ([080c0f3](https://github.com/box/box-annotations/commit/080c0f3))
* Update README.md (#14) ([0b55fe6](https://github.com/box/box-annotations/commit/0b55fe6))



<a name="0.1.0"></a>
# 0.1.0 (2017-10-30)

* Fix: Invalidate draw/highlight annotations without properly structured locations (#9) ([39a9493](https://github.com/box/box-annotations/commit/39a9493))
* Fix: Matching create highlight dialog to standard dialog (#8) ([d3a351a](https://github.com/box/box-annotations/commit/d3a351a))
* Fix: Move createHighlightDialog.isVisible check to DocAnnotator.js (#13) ([31643cd](https://github.com/box/box-annotations/commit/31643cd))
* Chore: Cleanup from separating Annotations from Preview (#12) ([08abdc8](https://github.com/box/box-annotations/commit/08abdc8))
* Chore: Migrating annotations code into repo ([3521db1](https://github.com/box/box-annotations/commit/3521db1))
* Chore: Update README.md & CHANGELOG.md (#11) ([32f690a](https://github.com/box/box-annotations/commit/32f690a))
* Update: Documentation & license updates (#10) ([294bd6d](https://github.com/box/box-annotations/commit/294bd6d))
* Initial commit ([ef5245b](https://github.com/box/box-annotations/commit/ef5245b))
* Update README.md ([ee7cf59](https://github.com/box/box-annotations/commit/ee7cf59))
* New: Building as npm package ([253ea03](https://github.com/box/box-annotations/commit/253ea03))
* New: Copying annotations code from box/box-content-preview ([12aaab4](https://github.com/box/box-annotations/commit/12aaab4))



<a name="0.0.11"></a>
## 0.0.11 (2017-10-26)

* Chore: Migrating annotations code into repo ([b2cd9b1](https://github.com/box/box-annotations/commit/b2cd9b1))
* New: Building as npm package ([253ea03](https://github.com/box/box-annotations/commit/253ea03))
* New: Copying annotations code from box/box-content-preview ([12aaab4](https://github.com/box/box-annotations/commit/12aaab4))
* Initial commit ([ef5245b](https://github.com/box/box-annotations/commit/ef5245b))



