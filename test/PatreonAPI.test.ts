import {describe, expect, test} from "@jest/globals";
import {DefaultFabricatePatreonAPIFactory} from "../src/scripts/patreon/PatreonAPIFactory";
import {StubClientSettings} from "./stubs/foundry/StubClientSettings";
import {DefaultPatreonFeature, PatreonFeature} from "../src/scripts/patreon/PatreonFeature";
import Properties from "../src/scripts/Properties";
import {StubHashProvider} from "./stubs/foundry/StubHashProvider";

describe("PatreonAPI", () => {

    describe("hasFeature", () => {

        test("should return true if the correct secret key is set", async () => {

            const secretOne = "yawing-vulnerability";
            const targetOne = "e23d212ae910621133b41c7287e1ce70e17d5b91ed1fa189df4739bb2e506ce6";

            const featureOneId = "feature-1";
            const patreonFeatures: PatreonFeature[] = [
                new DefaultPatreonFeature({
                    id: featureOneId,
                    name: "Feature One",
                    description: "Feature one description",
                    targets: [targetOne],
                })
            ];

            const stubClientSettings = new StubClientSettings();
            await stubClientSettings.set(Properties.module.id, Properties.settings.patreon.secretKey.key, secretOne);
            const patreonAPIFactory = new DefaultFabricatePatreonAPIFactory({
                clientSettings: stubClientSettings,
                hashProvider: new StubHashProvider(new Map([
                    [secretOne, targetOne],
                ])),
            })
            const underTest = patreonAPIFactory.make(patreonFeatures);

            const result = await underTest.isEnabled(featureOneId);
            expect(result).toBe(true);

        });

        test("should return false if an incorrect secret key is set", async () => {

            const secretOne = "doting-consistency";
            const targetOne = "e23d212ae910621133b41c7287e1ce70e17d5b91ed1fa189df4739bb2e506ce6";

            const featureOneId = "feature-1";
            const patreonFeatures: PatreonFeature[] = [
                new DefaultPatreonFeature({
                    id: featureOneId,
                    name: "Feature One",
                    description: "Feature one description",
                    targets: [targetOne],
                })
            ];

            const stubClientSettings = new StubClientSettings();
            await stubClientSettings.set(Properties.module.id, Properties.settings.patreon.secretKey.key, secretOne);
            const patreonAPIFactory = new DefaultFabricatePatreonAPIFactory({
                clientSettings: stubClientSettings,
                hashProvider: new StubHashProvider(),
            })
            const underTest = patreonAPIFactory.make(patreonFeatures);

            const result = await underTest.isEnabled(featureOneId);
            expect(result).toBe(false);

        });

        test("should recognise a target with multiple enabled features", async () => {

            const secretOne = "insidious-trout";
            const secretTwo = "bland-flora";
            const secretThree = "idealistic-kangaroo";
            const targetOne = "e23d212ae910621133b41c7287e1ce70e17d5b91ed1fa189df4739bb2e506ce6";
            const targetTwo = "ca9c7fa685ccb2809012ffc201694dde3a1930c208e1904150533568681aed70";
            const targetThree = "dba3b7a064739778d0e66520d0c91de1a0947b63b6dc03b88cde939c89d8459d";

            const featureOneId = "feature-1";
            const featureTwoId = "feature-2";
            const patreonFeatures: PatreonFeature[] = [
                new DefaultPatreonFeature({
                    id: featureOneId,
                    name: "Feature One",
                    description: "Feature one description",
                    targets: [targetOne, targetTwo],
                }),
                new DefaultPatreonFeature({
                    id: featureTwoId,
                    name: "Feature Two",
                    description: "Feature two description",
                    targets: [targetTwo],
                }),
            ];

            const stubClientSettings = new StubClientSettings();
            await stubClientSettings.set(Properties.module.id, Properties.settings.patreon.secretKey.key, secretTwo);
            const patreonAPIFactory = new DefaultFabricatePatreonAPIFactory({
                clientSettings: stubClientSettings,
                hashProvider: new StubHashProvider(new Map([
                    [secretOne, targetOne],
                    [secretTwo, targetTwo],
                    [secretThree, targetThree],
                ])),
            })
            const underTest = patreonAPIFactory.make(patreonFeatures);

            const featureOneEnabled = await underTest.isEnabled(featureOneId);
            expect(featureOneEnabled).toBe(true);
            const featureTwoEnabled = await underTest.isEnabled(featureTwoId);
            expect(featureTwoEnabled).toBe(true);

        });

    });

});