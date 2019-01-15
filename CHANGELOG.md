## 3.6.0 (2019-01-15)

* Fix: Don't display @mention selector in ACF (#323) ([a474251](https://github.com/box/box-annotations/commit/a474251)), closes [#323](https://github.com/box/box-annotations/issues/323)
* Fix: Drawing threads now destroy their event handlers properly (#317) ([ba3795d](https://github.com/box/box-annotations/commit/ba3795d)), closes [#317](https://github.com/box/box-annotations/issues/317)
* Fix: Functional tests (#320) ([bba4a9c](https://github.com/box/box-annotations/commit/bba4a9c)), closes [#320](https://github.com/box/box-annotations/issues/320)
* Fix: Only unbind listeners from existing DOM elements (#321) ([6a71a9e](https://github.com/box/box-annotations/commit/6a71a9e)), closes [#321](https://github.com/box/box-annotations/issues/321)
* Update: Improve and simplify annotation button and icon styles (#318) ([538fbd2](https://github.com/box/box-annotations/commit/538fbd2)), closes [#318](https://github.com/box/box-annotations/issues/318)
* Chore: Add webpack-dev-server and basic fixture for local dev (#316) ([7e3c01b](https://github.com/box/box-annotations/commit/7e3c01b)), closes [#316](https://github.com/box/box-annotations/issues/316)
* Chore: Update doc and test fixtures to support IE11 (#319) ([6f9d783](https://github.com/box/box-annotations/commit/6f9d783)), closes [#319](https://github.com/box/box-annotations/issues/319)



## 3.5.0 (2018-12-13)

* Fix: AnnotationPopover CSS to not hide popover svgs (#304) ([83ca5b7](https://github.com/box/box-annotations/commit/83ca5b7)), closes [#304](https://github.com/box/box-annotations/issues/304)
* Fix: date appears incorrectly for point annotations in IE11 (#312) ([bcd6ae5](https://github.com/box/box-annotations/commit/bcd6ae5)), closes [#312](https://github.com/box/box-annotations/issues/312)
* Fix: Don't render until AFTER all are fetched (#311) ([0e3fbff](https://github.com/box/box-annotations/commit/0e3fbff)), closes [#311](https://github.com/box/box-annotations/issues/311)
* Fix: Ensure dialog is still visible on undo/redo (#302) ([1c8a7e2](https://github.com/box/box-annotations/commit/1c8a7e2)), closes [#302](https://github.com/box/box-annotations/issues/302)
* Fix: Ensure thread number is persisted for annotation replies (#307) ([734fc6c](https://github.com/box/box-annotations/commit/734fc6c)), closes [#307](https://github.com/box/box-annotations/issues/307)
* Fix: Functional tests to work with React components (#303) ([4f0418e](https://github.com/box/box-annotations/commit/4f0418e)), closes [#303](https://github.com/box/box-annotations/issues/303)
* Fix: Get mode button from header element rather than container (#308) ([b50d72b](https://github.com/box/box-annotations/commit/b50d72b)), closes [#308](https://github.com/box/box-annotations/issues/308)
* Fix: Point image annotations popover should be on annotated element (#305) ([6d71dee](https://github.com/box/box-annotations/commit/6d71dee)), closes [#305](https://github.com/box/box-annotations/issues/305)
* Fix: Reset current annotation thread immediately on save (#313) ([19c89cc](https://github.com/box/box-annotations/commit/19c89cc)), closes [#313](https://github.com/box/box-annotations/issues/313)
* Fix: Reset undo/redo buttons on drawing save/delete (#306) ([441f0f2](https://github.com/box/box-annotations/commit/441f0f2)), closes [#306](https://github.com/box/box-annotations/issues/306)
* Fix: Show comment list scrollbars only on overflow (#314) ([83c143e](https://github.com/box/box-annotations/commit/83c143e)), closes [#314](https://github.com/box/box-annotations/issues/314)
* Chore: Remove NSP from build (defunct) (#315) ([720802f](https://github.com/box/box-annotations/commit/720802f)), closes [#315](https://github.com/box/box-annotations/issues/315)
* Chore: Update test page for annotations 3.4 (#301) ([71afd21](https://github.com/box/box-annotations/commit/71afd21)), closes [#301](https://github.com/box/box-annotations/issues/301)
* Update: CSS className constants for react classNames (#299) ([b472a2e](https://github.com/box/box-annotations/commit/b472a2e)), closes [#299](https://github.com/box/box-annotations/issues/299)



## 3.4.0 (2018-11-28)

* Fix: Dialog not showing when creating points (#295) ([c0ee86f](https://github.com/box/box-annotations/commit/c0ee86f)), closes [#295](https://github.com/box/box-annotations/issues/295)
* Fix: Don't clear selection  if selecting outside of annotated element (#298) ([5e277a0](https://github.com/box/box-annotations/commit/5e277a0)), closes [#298](https://github.com/box/box-annotations/issues/298)
* Fix: Fix test site for IE 11 (#300) ([359bda3](https://github.com/box/box-annotations/commit/359bda3)), closes [#300](https://github.com/box/box-annotations/issues/300)
* Fix: Positioning of undo/redo drawing buttons in header on mobile (#296) ([873394f](https://github.com/box/box-annotations/commit/873394f)), closes [#296](https://github.com/box/box-annotations/issues/296)
* Chore: Add Annotations test page to be hosted by github pages (#294) ([b91ade9](https://github.com/box/box-annotations/commit/b91ade9)), closes [#294](https://github.com/box/box-annotations/issues/294)
* Chore: Ignore js and json in i18n (#297) ([e691bdc](https://github.com/box/box-annotations/commit/e691bdc)), closes [#297](https://github.com/box/box-annotations/issues/297)



## 3.3.0 (2018-11-20)

* Fix: Clear highlight selection on mousedown and hideAnnotations() (#293) ([b60bc56](https://github.com/box/box-annotations/commit/b60bc56)), closes [#293](https://github.com/box/box-annotations/issues/293)
* Fix: Ensure deleteSuccessHandler destroys thread when necessary (#289) ([e972a72](https://github.com/box/box-annotations/commit/e972a72)), closes [#289](https://github.com/box/box-annotations/issues/289)
* Fix: Ensure popover parent element is determined correctly (#292) ([eab98ec](https://github.com/box/box-annotations/commit/eab98ec)), closes [#292](https://github.com/box/box-annotations/issues/292)
* Fix: Popover CSS issues  (#287) ([e64b3f8](https://github.com/box/box-annotations/commit/e64b3f8)), closes [#287](https://github.com/box/box-annotations/issues/287)
* Fix: Reset create highlight UI when mouse hasn't moved on mouseup (#290) ([4abd611](https://github.com/box/box-annotations/commit/4abd611)), closes [#290](https://github.com/box/box-annotations/issues/290)
* Fix: Reset popover UI on re-render/scale events (#284) ([43e5cb0](https://github.com/box/box-annotations/commit/43e5cb0)), closes [#284](https://github.com/box/box-annotations/issues/284)
* Fix: Unfocus textarea on comment post/cancel (#286) ([448347c](https://github.com/box/box-annotations/commit/448347c)), closes [#286](https://github.com/box/box-annotations/issues/286)
* Fix: Unregister drawing on mode cancel (#288) ([12d5f6d](https://github.com/box/box-annotations/commit/12d5f6d)), closes [#288](https://github.com/box/box-annotations/issues/288)
* Chore: Remove unecesary highlightThread.onMouseDown() (#291) ([a01db9f](https://github.com/box/box-annotations/commit/a01db9f)), closes [#291](https://github.com/box/box-annotations/issues/291)
* Update: Husky scripts (#285) ([eaff0f0](https://github.com/box/box-annotations/commit/eaff0f0)), closes [#285](https://github.com/box/box-annotations/issues/285)
* Mojito: Update translations (#283) ([529bbc0](https://github.com/box/box-annotations/commit/529bbc0)), closes [#283](https://github.com/box/box-annotations/issues/283)



## 3.2.0 (2018-11-13)

* Mojito: Update translations (#282) ([48d2f8f](https://github.com/box/box-annotations/commit/48d2f8f)), closes [#282](https://github.com/box/box-annotations/issues/282)



## 3.1.0 (2018-11-07)

* Fix: Alignment of createdAt timestamp and user's name (#277) ([b4980fb](https://github.com/box/box-annotations/commit/b4980fb)), closes [#277](https://github.com/box/box-annotations/issues/277)
* Fix: Ensure drawings are only registered once with the controller (#278) ([feedc87](https://github.com/box/box-annotations/commit/feedc87)), closes [#278](https://github.com/box/box-annotations/issues/278)
* Fix: Ensure onSelectionChange isn't triggered while creating highlights (#281) ([3130210](https://github.com/box/box-annotations/commit/3130210)), closes [#281](https://github.com/box/box-annotations/issues/281)
* Fix: Remove clickHandler from DrawingModeController (#280) ([0c7fe0f](https://github.com/box/box-annotations/commit/0c7fe0f)), closes [#280](https://github.com/box/box-annotations/issues/280)
* Fix: Remove focus trap on AnnotationPopover on mobile (#279) ([a14fe6b](https://github.com/box/box-annotations/commit/a14fe6b)), closes [#279](https://github.com/box/box-annotations/issues/279)
* Chore: Fix publish script (#275) ([25c40f7](https://github.com/box/box-annotations/commit/25c40f7)), closes [#275](https://github.com/box/box-annotations/issues/275)
* Chore: Upgrade husky (#276) ([14bda8a](https://github.com/box/box-annotations/commit/14bda8a)), closes [#276](https://github.com/box/box-annotations/issues/276)



## 3.0.0 (2018-10-31)

* Chore: Adding rsync to yarn run watch (#241) ([afe6ab6](https://github.com/box/box-annotations/commit/afe6ab6)), closes [#241](https://github.com/box/box-annotations/issues/241)
* Chore: Cleanup flow types (#274) ([33adb47](https://github.com/box/box-annotations/commit/33adb47)), closes [#274](https://github.com/box/box-annotations/issues/274)
* Chore: Reduce redundant point creation via buffering (#237) ([2bfc2f1](https://github.com/box/box-annotations/commit/2bfc2f1)), closes [#237](https://github.com/box/box-annotations/issues/237)
* Breaking: Migrate Annotations UI into React (#251) ([d853b80](https://github.com/box/box-annotations/commit/d853b80)), closes [#251](https://github.com/box/box-annotations/issues/251)



## 2.3.0 (2018-10-16)

* Chore: Add supported excel types. Remove greenkeeper badge (#227) ([8bd1bb9](https://github.com/box/box-annotations/commit/8bd1bb9)), closes [#227](https://github.com/box/box-annotations/issues/227)
* Chore: break text to fit into dialog (#230) ([3a5cc86](https://github.com/box/box-annotations/commit/3a5cc86)), closes [#230](https://github.com/box/box-annotations/issues/230)
* Chore: Remove unused thread.mouseoutHandler() (#206) ([1017082](https://github.com/box/box-annotations/commit/1017082)), closes [#206](https://github.com/box/box-annotations/issues/206)
* Chore: Replace Karma with Jest for testing framework (#199) ([a847b01](https://github.com/box/box-annotations/commit/a847b01)), closes [#199](https://github.com/box/box-annotations/issues/199)
* Chore: Update preview version to 1.54.0 in functional tests (#239) ([6de2cf4](https://github.com/box/box-annotations/commit/6de2cf4)), closes [#239](https://github.com/box/box-annotations/issues/239)
* Fix: Cursor type in annotation dialog (#195) ([b568288](https://github.com/box/box-annotations/commit/b568288)), closes [#195](https://github.com/box/box-annotations/issues/195)
* Fix: Functional tests scripts ([2dfc22e](https://github.com/box/box-annotations/commit/2dfc22e))
* Fix: travis.yml config (#203) ([a71ecb6](https://github.com/box/box-annotations/commit/a71ecb6)), closes [#203](https://github.com/box/box-annotations/issues/203)
* Update: Annotations with header (#233) ([91cdce3](https://github.com/box/box-annotations/commit/91cdce3)), closes [#233](https://github.com/box/box-annotations/issues/233)
* Update: box-react-ui to v25.6.0 (#204) ([398b4c3](https://github.com/box/box-annotations/commit/398b4c3)), closes [#204](https://github.com/box/box-annotations/issues/204)
* Update: Filter multi-image functional tests separately from image tests ([b15a007](https://github.com/box/box-annotations/commit/b15a007))
* Update: Test yaml changes ([bb58296](https://github.com/box/box-annotations/commit/bb58296))
* Update: Webpack 4 + dependencies (#208) ([b2ba5df](https://github.com/box/box-annotations/commit/b2ba5df)), closes [#208](https://github.com/box/box-annotations/issues/208)
* Update .travis.yml ([9c09e8e](https://github.com/box/box-annotations/commit/9c09e8e))
* Update .travis.yml ([236c383](https://github.com/box/box-annotations/commit/236c383))
* Update add-annotation-type.md ([fcceb3e](https://github.com/box/box-annotations/commit/fcceb3e))
* Update add-annotation-type.md ([ca5c6f0](https://github.com/box/box-annotations/commit/ca5c6f0))
* Update webpack.selenium.config.js ([e008f68](https://github.com/box/box-annotations/commit/e008f68))
* New: Add functional tests for image files (#197) ([7c7b39e](https://github.com/box/box-annotations/commit/7c7b39e)), closes [#197](https://github.com/box/box-annotations/issues/197)



<a name="2.2.0"></a>
## 2.2.0 (2018-06-05)

* Fix: Ensure pending annotations are destroyed on re-render (#194) ([1422357](https://github.com/box/box-annotations/commit/1422357)), closes [#194](https://github.com/box/box-annotations/issues/194)
* Fix: Functional tests (#193) ([82bf717](https://github.com/box/box-annotations/commit/82bf717)), closes [#193](https://github.com/box/box-annotations/issues/193)
* Fix: if annotation click is outside the doc, ignore (#192) ([b74484b](https://github.com/box/box-annotations/commit/b74484b)), closes [#192](https://github.com/box/box-annotations/issues/192)



<a name="2.1.0"></a>
## 2.1.0 (2018-05-29)

* Fix: Hiding annotations for the image viewer (#189) ([71aea4b](https://github.com/box/box-annotations/commit/71aea4b)), closes [#189](https://github.com/box/box-annotations/issues/189)
* Fix: Mobile point annotation behavior (#191) ([2416212](https://github.com/box/box-annotations/commit/2416212)), closes [#191](https://github.com/box/box-annotations/issues/191)
* Fix: Prevent loss of dialog header when adding an annotation on android (#187) ([a33cf4a](https://github.com/box/box-annotations/commit/a33cf4a)), closes [#187](https://github.com/box/box-annotations/issues/187)
* Fix: reset selection when entering annotation mode (#190) ([f16a273](https://github.com/box/box-annotations/commit/f16a273)), closes [#190](https://github.com/box/box-annotations/issues/190)



<a name="2.0.0"></a>
## 2.0.0 (2018-05-15)

* Breaking: Remove hover behavior to display dialogs (#155) ([4850702](https://github.com/box/box-annotations/commit/4850702)), closes [#155](https://github.com/box/box-annotations/issues/155)
* Chore: New issue/feature request templates (#188) ([efde642](https://github.com/box/box-annotations/commit/efde642)), closes [#188](https://github.com/box/box-annotations/issues/188)



<a name="1.6.0"></a>
## 1.6.0 (2018-05-01)

* Fix: functional tests (#185) ([664bfe3](https://github.com/box/box-annotations/commit/664bfe3)), closes [#185](https://github.com/box/box-annotations/issues/185)
* Fix: Functional tests + cleanup annotations after Features (#186) ([ea868c4](https://github.com/box/box-annotations/commit/ea868c4)), closes [#186](https://github.com/box/box-annotations/issues/186)
* Fix: Use BRUI CSS for create dialog textarea (#184) ([8faef28](https://github.com/box/box-annotations/commit/8faef28)), closes [#184](https://github.com/box/box-annotations/issues/184)
* New: Add basic UI tests for point & highlight comment annotations (#182) ([44597de](https://github.com/box/box-annotations/commit/44597de)), closes [#182](https://github.com/box/box-annotations/issues/182)



<a name="1.5.0"></a>
## 1.5.0 (2018-04-24)

* Update: dependencies (#177) ([5599ca6](https://github.com/box/box-annotations/commit/5599ca6)), closes [#177](https://github.com/box/box-annotations/issues/177)
* Chore: Add tests to select/delete drawing (#180) ([90af909](https://github.com/box/box-annotations/commit/90af909)), closes [#180](https://github.com/box/box-annotations/issues/180)
* Chore: Ensure all new drawings get deleted in functional tests (#181) ([8339dbf](https://github.com/box/box-annotations/commit/8339dbf)), closes [#181](https://github.com/box/box-annotations/issues/181)
* Chore: Prefix box-react-ui css with .ba-annotation-dialog (#178) ([29cc0fd](https://github.com/box/box-annotations/commit/29cc0fd)), closes [#178](https://github.com/box/box-annotations/issues/178)
* Fix: Replace {1} with user name on drawing save (#179) ([408b495](https://github.com/box/box-annotations/commit/408b495)), closes [#179](https://github.com/box/box-annotations/issues/179)



<a name="1.4.0"></a>
## 1.4.0 (2018-04-17)

* Chore: Add .ba-annotations-loaded to preview when load completes (#167) ([7f62860](https://github.com/box/box-annotations/commit/7f62860)), closes [#167](https://github.com/box/box-annotations/issues/167)
* Chore: Add basic drawing annotations test (#169) ([a35853d](https://github.com/box/box-annotations/commit/a35853d)), closes [#169](https://github.com/box/box-annotations/issues/169)
* Chore: change release script remote to be release (#176) ([ba0e1c9](https://github.com/box/box-annotations/commit/ba0e1c9)), closes [#176](https://github.com/box/box-annotations/issues/176)
* Chore: Email preview-alert@box.com on functional-tests failure ([aea1cfa](https://github.com/box/box-annotations/commit/aea1cfa))
* Chore: Enable drawing annotations in functional tests express app (#171) ([628cd20](https://github.com/box/box-annotations/commit/628cd20)), closes [#171](https://github.com/box/box-annotations/issues/171)
* Chore: Functional test fixes (#172) ([580e1d7](https://github.com/box/box-annotations/commit/580e1d7)), closes [#172](https://github.com/box/box-annotations/issues/172)
* Chore: Increase timeout for plain highlight functional tests ([308025e](https://github.com/box/box-annotations/commit/308025e))
* Chore: Prefix imported styles to avoid leaking (#165) ([629ecab](https://github.com/box/box-annotations/commit/629ecab)), closes [#165](https://github.com/box/box-annotations/issues/165)
* Chore: unregister pending threads on destroy (#173) ([0b93e82](https://github.com/box/box-annotations/commit/0b93e82)), closes [#173](https://github.com/box/box-annotations/issues/173)
* Fix: Allow textarea to be interactable in certain scenarios (#174) ([9ce5b0a](https://github.com/box/box-annotations/commit/9ce5b0a)), closes [#174](https://github.com/box/box-annotations/issues/174)
* Fix: Change remaining CSS selectors to use ba- prefix (#164) ([baf4ebc](https://github.com/box/box-annotations/commit/baf4ebc)), closes [#164](https://github.com/box/box-annotations/issues/164)
* Fix: firefox comment collapse on mouseout (#175) ([c63f087](https://github.com/box/box-annotations/commit/c63f087)), closes [#175](https://github.com/box/box-annotations/issues/175)
* Fix: Only preventDefault() on mobile dialog button clicks (#170) ([a926d0e](https://github.com/box/box-annotations/commit/a926d0e)), closes [#170](https://github.com/box/box-annotations/issues/170)
* Fix: quadpoint CSS selectors (#163) ([f881b6e](https://github.com/box/box-annotations/commit/f881b6e)), closes [#163](https://github.com/box/box-annotations/issues/163)
* Increase selenium timeout ([6ae7e32](https://github.com/box/box-annotations/commit/6ae7e32))
* Update .travis.yml ([a2aa15e](https://github.com/box/box-annotations/commit/a2aa15e))
* Update .travis.yml ([e395350](https://github.com/box/box-annotations/commit/e395350))
* New: Add plain highlight functional tests (#168) ([b8b29aa](https://github.com/box/box-annotations/commit/b8b29aa)), closes [#168](https://github.com/box/box-annotations/issues/168)
* New: Setup selenium functional UI framework (#158) ([db9a320](https://github.com/box/box-annotations/commit/db9a320)), closes [#158](https://github.com/box/box-annotations/issues/158)



<a name="1.3.0"></a>
# 1.3.0 (2018-04-10)

* Chore: Only reset to upstream/master for major/minor releases (#160) ([e6e619c](https://github.com/box/box-annotations/commit/e6e619c))
* Chore: Removing DrawingModeController dependency on DocDrawingThread (#161) ([a1c582d](https://github.com/box/box-annotations/commit/a1c582d))
* Fix: Create highlight dialog is misaligned on first highlight (#159) ([d4d4fdd](https://github.com/box/box-annotations/commit/d4d4fdd))



<a name="1.2.0"></a>
# 1.2.0 (2018-04-03)

* Fix: Cleaning up incorrect selectors (#157) ([1710ece](https://github.com/box/box-annotations/commit/1710ece))
* Fix: Mobile dialog doesn't properly close on delete cancel/confirm (#148) ([523217a](https://github.com/box/box-annotations/commit/523217a)), closes [#148](https://github.com/box/box-annotations/issues/148)
* Chore: Add nsp to scan from known vulnerabilities (#153) ([5db437d](https://github.com/box/box-annotations/commit/5db437d))
* Chore: Group CSS constants in a more readable manner (#150) ([b110632](https://github.com/box/box-annotations/commit/b110632))
* Chore: Remove -x tag in release script (#151) ([abbaf03](https://github.com/box/box-annotations/commit/abbaf03))
* Chore: Run eslint on test files (#149) ([75277fc](https://github.com/box/box-annotations/commit/75277fc))
* Chore: Use decode keydown from box-react-ui to prevent duplication (#152) ([c54de5e](https://github.com/box/box-annotations/commit/c54de5e))
* Chore: Use node 8 for building (#154) ([df7a4e5](https://github.com/box/box-annotations/commit/df7a4e5))
* Docs: Updating issue template (#156) ([a303ac4](https://github.com/box/box-annotations/commit/a303ac4))



<a name="1.1.0"></a>
# 1.1.0 (2018-03-27)

* New: More detailed documentation (#146) ([dea85de](https://github.com/box/box-annotations/commit/dea85de))
* Fix: Highlighting and highlighting again clears highlight (#147) ([499bc5f](https://github.com/box/box-annotations/commit/499bc5f))



<a name="1.0.0"></a>
# 1.0.0 (2018-03-20)

* Breaking: Enable draw annotations by default for document filetypes (#143) ([727d085](https://github.com/box/box-annotations/commit/727d085))
* Fix: Binds handlers appropriately for desktop/touch/mobile devices (#139) ([cf69943](https://github.com/box/box-annotations/commit/cf69943))
* Fix: Cleanup hiding/closing of the mobile dialog (#141) ([99ccc22](https://github.com/box/box-annotations/commit/99ccc22))
* Fix: Don't save empty drawing threads (#138) ([a15a7ec](https://github.com/box/box-annotations/commit/a15a7ec))
* Chore: Don't allow selection of saved thread in draw mode (#140) ([b0afeb4](https://github.com/box/box-annotations/commit/b0afeb4))



<a name="0.16.0"></a>
# 0.16.0 (2018-03-13)

* Fix: Draw annotation mode bugs (#131) ([7430e54](https://github.com/box/box-annotations/commit/7430e54))
* Fix: Ensure isMobile and hasTouch gets passed on to all dialogs (#136) ([b3f7ec3](https://github.com/box/box-annotations/commit/b3f7ec3))
* Fix: Move dependencies to dev dependencies (#133) ([bffe5c1](https://github.com/box/box-annotations/commit/bffe5c1))
* Fix: Re-draw drawing thread boundary on path change (#135) ([d4f44ea](https://github.com/box/box-annotations/commit/d4f44ea))
* Revert "New: Enable draw annotations by default (#115)" (#134) ([93f92af](https://github.com/box/box-annotations/commit/93f92af))
* Chore: Cleanup instantiation documentation in README (#132) ([f5ff695](https://github.com/box/box-annotations/commit/f5ff695))



<a name="0.15.0"></a>
## 0.15.0 (2018-03-07)

* Fix: Pass event to resetHighlightSelection to reset dialog (#129) ([89c84d8](https://github.com/box/box-annotations/commit/89c84d8)), closes [#129](https://github.com/box/box-annotations/issues/129)
* Fix: Pending highlight is not cleared on powerpoint page scroll (#125) ([777678a](https://github.com/box/box-annotations/commit/777678a)), closes [#125](https://github.com/box/box-annotations/issues/125)
* Fix: Prevent default behavior during mobile point annotation mode (#130) ([ad3d0b2](https://github.com/box/box-annotations/commit/ad3d0b2)), closes [#130](https://github.com/box/box-annotations/issues/130)
* Chore: Clean up all tests (#124) ([01d5650](https://github.com/box/box-annotations/commit/01d5650)), closes [#124](https://github.com/box/box-annotations/issues/124)



<a name="0.14.0"></a>
# 0.14.0 (2018-02-27)

* Chore: Adding yarn install before common package.json scripts (#122) ([ee5fd57](https://github.com/box/box-annotations/commit/ee5fd57))
* Update dependencies to enable Greenkeeper 🌴 (#120) ([13ee8ff](https://github.com/box/box-annotations/commit/13ee8ff))
* New: Continuous Point Annotation Mode (#105) ([496f651](https://github.com/box/box-annotations/commit/496f651))
* New: Enable draw annotations by default (#115) ([4994699](https://github.com/box/box-annotations/commit/4994699))
* New: enable travis CI on greenkeeper branches (#118) ([4e0cd67](https://github.com/box/box-annotations/commit/4e0cd67))



<a name="0.13.0"></a>
# 0.13.0 (2018-02-13)

* Fix: Focus dialog textareas on show() (#113) ([f8bfd66](https://github.com/box/box-annotations/commit/f8bfd66))
* Fix: Maintain bp prefix for preview classes (#116) ([1d1a393](https://github.com/box/box-annotations/commit/1d1a393)), closes [#116](https://github.com/box/box-annotations/issues/116)
* Chore: Prepending CSS classes with ba instead of bp (#112) ([2a39741](https://github.com/box/box-annotations/commit/2a39741))



<a name="0.12.0"></a>
# 0.12.0 (2018-02-06)

* Chore: add flags to bash scripts to bail on errors (#106) ([d8ac7a5](https://github.com/box/box-annotations/commit/d8ac7a5))
* Chore: Position based on first annotation in thread (#104) ([4035853](https://github.com/box/box-annotations/commit/4035853))
* Fix: ability to create highlight annotations on a Microsoft Surface (#108) ([a8c613a](https://github.com/box/box-annotations/commit/a8c613a))
* Fix: Cancel button while creating new point annotation (#109) ([77c26d7](https://github.com/box/box-annotations/commit/77c26d7))
* Fix: Create point dialog doesn't stop propogating click event on mobile (#111) ([0ce0153](https://github.com/box/box-annotations/commit/0ce0153))
* Fix: Do not redraw deleted highlight threads (#107) ([0d970d0](https://github.com/box/box-annotations/commit/0d970d0))
* Fix: Escape key properly destroys pending point annotation (#114) ([5a2985c](https://github.com/box/box-annotations/commit/5a2985c))



<a name="0.11.0"></a>
# 0.11.0 (2018-01-31)

* Fix: Cleanup page thread access methods (#103) ([3922c96](https://github.com/box/box-annotations/commit/3922c96))



<a name="0.10.0"></a>
# 0.10.0 (2018-01-23)

* Fix: Filter out illegal types from viewer options (#101) ([ad66486](https://github.com/box/box-annotations/commit/ad66486))
* Fix: Mobile cleanup (#102) ([c599aea](https://github.com/box/box-annotations/commit/c599aea))
* Chore: Use box-react-ui for base CSS styles (#92) ([1644d5b](https://github.com/box/box-annotations/commit/1644d5b))
* New: Store all page highlight threads as an rbush tree (#100) ([86d0468](https://github.com/box/box-annotations/commit/86d0468))



<a name="0.9.0"></a>
# 0.9.0 (2018-01-11)

* Fix: Do not destroy pending point threads on mobile re-render (#99) ([3d6f0ef](https://github.com/box/box-annotations/commit/3d6f0ef))
* Fix: Stop propagating drawing selection event after first click (#97) ([d8c134b](https://github.com/box/box-annotations/commit/d8c134b))



<a name="0.8.0"></a>
# 0.8.0 (2018-01-03)

* Fix: Clear both highlight canvases when deleting highlights (#96) ([cabcba1](https://github.com/box/box-annotations/commit/cabcba1))
* Fix: Don't deactivate dialog when canceling new annotation (#91) ([788d1de](https://github.com/box/box-annotations/commit/788d1de))
* Fix: Drawing buttons styling (#82) ([400c6ff](https://github.com/box/box-annotations/commit/400c6ff))
* Fix: Ensure drawing dialog is setup on first save (#81) ([9da70ab](https://github.com/box/box-annotations/commit/9da70ab))
* Fix: Extra padding on escaped comment newlines (#95) ([0e62bce](https://github.com/box/box-annotations/commit/0e62bce))
* Fix: More accurate dialog placement for highlights (#83) ([8b768a9](https://github.com/box/box-annotations/commit/8b768a9))
* Fix: Only reset current page highlights on selection change (#79) ([662f2ea](https://github.com/box/box-annotations/commit/662f2ea))
* Fix: Remove fixed position of mobile header (#85) ([6ca5c01](https://github.com/box/box-annotations/commit/6ca5c01)), closes [#85](https://github.com/box/box-annotations/issues/85)
* Fix: Render highlight comments on their own canvas (#93) ([9eeeace](https://github.com/box/box-annotations/commit/9eeeace))
* Fix: Safety checks if no threads are registered in the draw controller (#88) ([3e54845](https://github.com/box/box-annotations/commit/3e54845))
* Fix: set textarea.placeholder when generating dialogs (#74) ([496a545](https://github.com/box/box-annotations/commit/496a545))
* Fix: Show the appropriate buttons in mobile create highlight dialog (#75) ([8114d0c](https://github.com/box/box-annotations/commit/8114d0c))
* Fix: Uncaught errors in drawingModeController.handleSelection() (#87) ([e0240f6](https://github.com/box/box-annotations/commit/e0240f6))
* Chore: Enforce Lato font for annotation dialogs (#76) ([55b25b3](https://github.com/box/box-annotations/commit/55b25b3))
* Chore: Move threadmap entirely to mode controllers  (#71) ([00989ac](https://github.com/box/box-annotations/commit/00989ac))
* Chore: Moving rotateAnnotations() into ImageAnnotator (#94) ([b9dd7b1](https://github.com/box/box-annotations/commit/b9dd7b1))
* Chore: Now respect newline and symbols (#73) ([b7f52d2](https://github.com/box/box-annotations/commit/b7f52d2))
* Update: README.md & variable names in BoxAnnotations.js (#89) ([ab62d18](https://github.com/box/box-annotations/commit/ab62d18))
* Update: THIRD_PARTY_LICENSES (#90) ([4b0d97f](https://github.com/box/box-annotations/commit/4b0d97f))
* Update ISSUE_TEMPLATE.md ([8806f91](https://github.com/box/box-annotations/commit/8806f91))
* Update package.json ([418d368](https://github.com/box/box-annotations/commit/418d368))
* Update package.json ([5ffb68d](https://github.com/box/box-annotations/commit/5ffb68d))



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



