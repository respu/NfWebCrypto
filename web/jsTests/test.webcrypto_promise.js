/*
 *
 *  Copyright 2013 Netflix, Inc.
 *
 *     Licensed under the Apache License, Version 2.0 (the "License");
 *     you may not use this file except in compliance with the License.
 *     You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     distributed under the License is distributed on an "AS IS" BASIS,
 *     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *     See the License for the specific language governing permissions and
 *     limitations under the License.
 *
 */

(function () {
    "use strict";

    // get "crypto" from the right namespace
    var crypto,
        cryptoSubtle;
    
    if (window.msCrypto) { // IE
        crypto = window.msCrypto;
    } else if (window.nfNewCrypto) { // Chrome OS, Chrome with NfWebCrypto
        crypto = window.nfNewCrypto;
    } else if (window.crypto) {  // all others
        crypto = window.crypto;
    } else {
        console.log('no crypto namespace');
        return;
    }
    
    if (crypto.webkitSubtle) {  // Safari
        cryptoSubtle = crypto.webkitSubtle;
    } else if (crypto.subtle) { // all others
        cryptoSubtle = crypto.subtle;
    } else {
        console.log('no crypto.subtle namespace');
        return;
    }

    // --------------------------------------------------------------------------------
    describe("crypto interface", function () {

        it("crypto exists", function () {
            expect(crypto).toBeDefined();
        });

        it("crypto.getRandomValues exists", function () {
            expect(typeof crypto.getRandomValues).toEqual("function");
        });

        it("crypto.subtle exists", function () {
            expect(cryptoSubtle).toBeDefined();
        });

        it("crypto.subtle.encrypt exists", function () {
            expect(typeof cryptoSubtle.encrypt).toEqual("function");
        });

        it("crypto.subtle.decrypt exists", function () {
            expect(typeof cryptoSubtle.decrypt).toEqual("function");
        });

        it("crypto.subtle.sign exists", function () {
            expect(typeof cryptoSubtle.sign).toEqual("function");
        });

        it("crypto.subtle.verify exists", function () {
            expect(typeof cryptoSubtle.verify).toEqual("function");
        });

        it("crypto.subtle.digest exists", function () {
            expect(typeof cryptoSubtle.digest).toEqual("function");
        });

        it("crypto.subtle.generateKey exists", function () {
            expect(typeof cryptoSubtle.generateKey).toEqual("function");
        });

        it("crypto.subtle.importKey exists", function () {
            expect(typeof cryptoSubtle.importKey).toEqual("function");
        });

        it("crypto.subtle.exportKey exists", function () {
            expect(typeof cryptoSubtle.exportKey).toEqual("function");
        });

        it("crypto.subtle.wrapKey exists", function () {
            expect(typeof cryptoSubtle.wrapKey).toEqual("function");
        });

        it("crypto.subtle.unwrapKey exists", function () {
            expect(typeof cryptoSubtle.unwrapKey).toEqual("function");
        });

    });

    // --------------------------------------------------------------------------------

    describe("RandomSource", function () {

        it("getRandomValues", function () {
            runs(function () {
                var zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

                var abv1 = new Uint8Array(8);
                var abv2 = crypto.getRandomValues(abv1);

                expect(abv1).toBe(abv2);
                expect(abv2).toNotEqual(zeros);

                var abv3 = new Uint8Array(8);
                var abv4 = crypto.getRandomValues(abv3);

                expect(abv3).toBe(abv4);
                expect(base16.stringify(abv4)).not.toEqual(base16.stringify(zeros));
                expect(base16.stringify(abv4)).not.toEqual(base16.stringify(abv2));
            });

        });

    });

    // --------------------------------------------------------------------------------

    describe("SHA", function () {

        it("digest SHA-256", function () {
            // convenient calculator here: http://www.fileformat.info/tool/hash.htm
            var data = base16.parse("6162636462636465636465666465666765666768666768696768696a68696a6b696a6b6c6a6b6c6d6b6c6d6e6c6d6e6f6d6e6f706e6f7071"),
                signature_sha256_hex = "248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1";

            var signature,
                error,
                complete;

            runs(function () {
                cryptoSubtle.digest({ name: "SHA-256" }, data)
                .then(function (result) {
                    complete = true;
                    signature = result && new Uint8Array(result);
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return error || complete;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(complete).toBeTruthy();
                expect(base16.stringify(signature)).toBe(signature_sha256_hex);
            });
        });

        it("digest SHA-384", function () {
            // convenient calculator here: http://www.fileformat.info/tool/hash.htm
            var data = base16.parse("6162636462636465636465666465666765666768666768696768696a68696a6b696a6b6c6a6b6c6d6b6c6d6e6c6d6e6f6d6e6f706e6f7071"),
                signature_sha384_hex = "3391fdddfc8dc7393707a65b1b4709397cf8b1d162af05abfe8f450de5f36bc6b0455a8520bc4e6f5fe95b1fe3c8452b";

            var signature,
                error,
                complete;

            runs(function () {
                cryptoSubtle.digest({ name: "SHA-384" }, data)
                .then(function (result) {
                    complete = true;
                    signature = result && new Uint8Array(result);
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return error || complete;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(complete).toBeTruthy();
                expect(base16.stringify(signature)).toBe(signature_sha384_hex);
            });
        });
    });

    // --------------------------------------------------------------------------------

    describe("AES-CBC", function () {

        it("importKey/exportKey raw AES-CBC", function () {
            var error;

            var key,
                keyData = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F]),
                keyData2;

            runs(function () {
                error = undefined;
                // TODO:
                // Once https://www.w3.org/Bugs/Public/show_bug.cgi?id=21435 is resolved, might need to pass in length as part of AlgorithmIdentifier
                cryptoSubtle.importKey("raw", keyData, { name: "AES-CBC" }, true, [])
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return key || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.extractable).toBe(true);
            });

            runs(function () {
                error = undefined;
                cryptoSubtle.exportKey("raw", key)
                .then(function (result) {
                    keyData2 = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return keyData2 || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(keyData2).toBeDefined();
                expect(base16.stringify(keyData2)).toEqual(base16.stringify(keyData));
            });

        });

        it("importKey/exportKey jwk A128CBC oct", function () {
            var error;

            var rawData = base16.parse("17AE37CAD5EC70D2653FBE7E5E42414C"),
                key,
                jwkData = latin1.parse(JSON.stringify({
                    alg:    "A128CBC",
                    kty:    "oct",
                    use:    "enc",
                    extractable:    true,
                    k:      base64.stringifyUrlSafe(rawData),
                })),
                rawData2;

            runs(function () {
                error = undefined;
                cryptoSubtle.importKey("jwk", jwkData, { name: "AES-CBC" }, true, [])
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return key || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.extractable).toBe(true);
                expect(key.keyUsage).toEqual(["encrypt", "decrypt"]);
                expect(key.type).toBe("secret");
                // TODO: verify other fields of key
            });

            runs(function () {
                error = undefined;
                cryptoSubtle.exportKey("raw", key)
                .then(function (result) {
                    rawData2 = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return rawData2 || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(rawData2).toBeDefined();
                expect(base16.stringify(rawData2)).toEqual(base16.stringify(rawData));
            });

            runs(function () {
                error = undefined;
                rawData2 = undefined;
                cryptoSubtle.exportKey("jwk", key)
                .then(function (result) {
                    rawData2 = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return rawData2 || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(rawData2).toBeDefined();
                expect(JSON.parse(latin1.stringify(rawData2))).toEqual(JSON.parse(latin1.stringify(jwkData)));
            });
        });

        it("generateKey AES-CBC (extractable)", function () {
            var error;

            var keyLength = 128,
                key,
                keyData;

            runs(function () {
                error = undefined;
                cryptoSubtle.generateKey({ name: "AES-CBC", length: keyLength }, true, [])
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return key || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.extractable).toBe(true);
            });

            runs(function () {
                error = undefined;
                cryptoSubtle.exportKey("raw", key)
                .then(function (result) {
                    keyData = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return keyData || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(keyData).toBeDefined();
                expect(keyData.length).toEqual(keyLength / 8);
                expect(base16.stringify(keyData)).not.toEqual(base16.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
            });

        });

        it("generateKey AES-CBC (not extractable)", function () {
            var error;

            var keyLength = 128,
                key,
                keyData;

            runs(function () {
                error = undefined;
                cryptoSubtle.generateKey({ name: "AES-CBC", length: keyLength }, false, [])
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return key || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.extractable).toBe(false);
            });

            runs(function () {
                error = undefined;
                cryptoSubtle.exportKey("raw", key)
                .then(function (result) {
                    keyData = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return keyData || error;
            });

            runs(function () {
                expect(error).toBeDefined();
                expect(keyData).toBeUndefined();
            });

        });

        it("encrypt/decrypt AES-CBC", function () {

            var error;

            var key,
                keyData = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F]),
                iv = base16.parse("562e17996d093d28ddb3ba695a2e6f58"),
                clearText_hex = "000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f",
                clearText = base16.parse(clearText_hex),
                encrypted,
                decrypted;

            runs(function () {
                cryptoSubtle.importKey("raw", keyData, { name: "AES-CBC" }, true, ["encrypt", "decrypt"])
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return key || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
            });

            runs(function () {
                error = undefined;
                cryptoSubtle.encrypt({ name: "AES-CBC", iv: iv}, key, clearText)
                .then(function (result) {
                    encrypted = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return encrypted || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(encrypted).toBeDefined();
                expect(base16.stringify(encrypted)).not.toBe(clearText);
            });

            runs(function () {
                error = undefined;
                cryptoSubtle.decrypt({ name: "AES-CBC", iv: iv}, key, encrypted)
                .then(function (result) {
                    decrypted = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return decrypted || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(decrypted).toBeDefined();
                expect(base16.stringify(decrypted)).toBe(clearText_hex);
            });

        });

    });


    // --------------------------------------------------------------------------------

    describe("HMAC", function () {

        it("generateKey HMAC SHA-256", function () {
            var error;

            var keyLength = 256,   // note: matches the choice of SHA-256
                key,
                keyData;

            runs(function () {
                error = undefined;
                cryptoSubtle.generateKey({ name: "HMAC", hash: {name: "SHA-256"}}, true, [])
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return key || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.extractable).toBe(true);
            });

            runs(function () {
                error = undefined;
                cryptoSubtle.exportKey("raw", key)
                .then(function (result) {
                    keyData = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return keyData || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(keyData).toBeDefined();
                expect(keyData.length).toEqual(keyLength / 8);
                expect(base16.stringify(keyData)).not.toBe(base16.stringify([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]));
            });

        });

        it("importKey/sign/verify HMAC SHA-256", function () {
            var error,
                key,
                keyData = new Uint8Array([
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F,
                    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F
                ]);

            runs(function () {
                cryptoSubtle.importKey("raw", keyData, { name: "HMAC", hash: { name: "SHA-256" } }, true, ["sign", "verify"])
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return key || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
            });

            var data = base16.parse("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f"),
                signature;

            runs(function () {
                error = undefined;
                cryptoSubtle.sign({ name: "HMAC", hash: {name: "SHA-256" } }, key, data)
                .then(function (result) {
                    signature = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return signature || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(signature).toBeDefined();
            });

            var verified;

            runs(function () {
                error = undefined;
                cryptoSubtle.verify({ name: "HMAC", hash: "SHA-256" }, key, signature, data)
                .then(function (result) {
                    verified = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return verified !== undefined || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(verified).toBe(true);
            });

            // and bad signature

            runs(function () {
                error = undefined;
                verified = undefined;
                data[10] = data[10] ^ 0xFF;
                cryptoSubtle.verify({ name: "HMAC", hash: "SHA-256" }, key, signature, data)
                .then(function (result) {
                    verified = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return verified !== undefined || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(verified).toBe(false);
            });
        });
    });

    // --------------------------------------------------------------------------------

    describe("RSA keys", function () {

        it("importKey/exportKey jwk RSAES-PKCS1-v1_5 public key", function () {
            var error,
                jwkKeyData,
                rawData2,
                key;

            runs(function () {
                // key data is Uint8Array which is Latin1 encoded "{n: base64, e: base64}" json string
                jwkKeyData = latin1.parse(JSON.stringify({
                    kty: "RSA",
                    alg: "RSA1_5",
                    n: base64.stringifyUrlSafe(base16.parse(
                            "a8b3b284af8eb50b387034a860f146c4919f318763cd6c55" +
                            "98c8ae4811a1e0abc4c7e0b082d693a5e7fced675cf46685" +
                            "12772c0cbc64a742c6c630f533c8cc72f62ae833c40bf258" +
                            "42e984bb78bdbf97c0107d55bdb662f5c4e0fab9845cb514" +
                            "8ef7392dd3aaff93ae1e6b667bb3d4247616d4f5ba10d4cf" +
                            "d226de88d39f16fb"
                    )),
                    e: base64.stringifyUrlSafe(base16.parse("010001")),
                    extractable: true,
                }));
                cryptoSubtle.importKey("jwk", jwkKeyData, { name: "RSAES-PKCS1-v1_5" })
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return key || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.type).toBe("public");

                // TODO: confirm that these checks are valid and add them
                // expect(key.algorithm.name).toBe("RSAES-PKCS1-v1_5");
                // expect(key.extractable).toBe(false);
                // expect(key.keyUsage).toEqual([]);
            });
            
            runs(function () {
                error = undefined;
                rawData2 = undefined;
                cryptoSubtle.exportKey("jwk", key)
                .then(function (result) {
                    rawData2 = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return rawData2 || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(rawData2).toBeDefined();
                expect(JSON.parse(latin1.stringify(rawData2))).toEqual(JSON.parse(latin1.stringify(jwkKeyData)));
            });

        });

        // SPKI - Simple Public Key Infrastructure
        // openssl genrsa -out pair.pem 2048
        // openssl rsa -in pair.pem -out pubkey.der -outform DER -pubout
        // openssl enc -base64 -in pubkey.der
        var spkiPubKeyData = base64.parse(
            "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsjUf4UZyuZ5JKazU0Kq/" +
            "dbaVY0oQxYZcsCQxRrjKF6yQaHACzeubHHaXRLwXkCVvBf2V0HBdJ/xCiIqwos3X" +
            "CMgMWu0mzlSxfv0kyAuH46SzTZdAt5hJPMSjt+eTJI+9hYq6DNqN09ujBwlhQM2J" +
            "hI9V3tZhBD5nQPTNkXYRD3aZp5wWtErIdXDP4ZXFcPdu6sLjH68WZuR9M6Q5Xztz" +
            "O9DA7+m/7CHDvWWhlvuN15t1a4dwBuxlY0eZh1JjM6OPH9zJ2OKJIVOLNIE2WejQ" +
            "E5a7IarLOHM8bYtBZ7/tSyx3MkN40OjPA7ZWiEpyT/wDiZo45aLlN4vsWJpIcdqS" +
            "RwIDAQAB"
        );

        // PKCS #8: Private Key Information Syntax Standard #8
        // <private key of pair generated above>
        // openssl pkcs8 -topk8 -inform PEM -outform DER -in pair.pem -out privkey.der -nocrypt
        // openssl enc -base64 -in privkey.der
        var pkcs8PrivKeyData = base64.parse(
            "MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCyNR/hRnK5nkkp" +
            "rNTQqr91tpVjShDFhlywJDFGuMoXrJBocALN65scdpdEvBeQJW8F/ZXQcF0n/EKI" +
            "irCizdcIyAxa7SbOVLF+/STIC4fjpLNNl0C3mEk8xKO355Mkj72FiroM2o3T26MH" +
            "CWFAzYmEj1Xe1mEEPmdA9M2RdhEPdpmnnBa0Ssh1cM/hlcVw927qwuMfrxZm5H0z" +
            "pDlfO3M70MDv6b/sIcO9ZaGW+43Xm3Vrh3AG7GVjR5mHUmMzo48f3MnY4okhU4s0" +
            "gTZZ6NATlrshqss4czxti0Fnv+1LLHcyQ3jQ6M8DtlaISnJP/AOJmjjlouU3i+xY" +
            "mkhx2pJHAgMBAAECggEAfHDkZicPjdaeOF/b7CqPr99jygW6WHRO3SEo173KQWXb" +
            "IVK2Yp0Xn3SghPrjaWD6ejBuITOVmYpp23cdiVI7yoIHPqdD5ej2WTrkKF0E803b" +
            "d18bbhkFa03VFWK8OVe2fD43VSp4x2wkF5HRO7NLSCnfSNBixtfculs4AU908lov" +
            "lr+aJJYeaUvdvpo5Vk15DVXxO+YiPjVd+oZ/jfZQl3WvOZH9t6STF4Sk4KEntdop" +
            "kFQA6Z3dzcrp5XLMq7twMZMokVfLf0rW+1GX//LKxZhq0UM2HdPliWFvzB5WUbTe" +
            "23cMIanBxONs7alz7J16Pt/nfFTbJpwuyRE9pODLgQKBgQDrSqb1pVMyk9rTIB9E" +
            "ZyaWdyiRHkpzAcYyQGMN/4gLmAlLCQnclTPly7fl33y9uMmHVXd2zoOYSvSLOoNZ" +
            "6mJTHRg59142r92FVpcHz3k5JHjWrLpCTv2lD1NpJTFHwiEv37mbJWgCtfKcN9u1" +
            "gKg9DAKektJoS09pxDqXPqZuFwKBgQDB5E/94gNQ4L7IlY/g3tEBeQu0sbeHMyIe" +
            "MxE6p2HJWCi2akH27nd8AVfUtAnDkrzmcTCRY2CjJH4nM759IhjHlaUzpUeRQb43" +
            "ari8QnXLeE53uVpgDFTtJjH5ytua846H9r4utetr2Y+giAXU3+CdOldfGAJdwajB" +
            "eHigOjdLUQKBgQCR+IRQDTrqO9Qb+ueq9ht4aYBfV110r/sXnd5WBtuN5cqOJJNb" +
            "p6zEuXfjQp0Ozp8oOJuet0vopUfFQI3QsJpDWd93xsFKSByz5h5YmBxqmPfmps3+" +
            "6SZuym1C4/IIxKT2IGPznmdCl0JmLDlABwtYpCTT395tGZuw0C5ROmriDQKBgQCK" +
            "MqmxU/75DrftUG0U4rwmSJjHWkRt4UxYKh4FqHhSgrvCCUqrLp2LjYmE2i57b4Ok" +
            "3Ni5SBQBNGmWl5MWrc7rswXlIdE4/5sM9MxnoxdCx6VmQH7iJugBgE/us2CDuUXG" +
            "M2Cq+o+qd4+f5FQDvu7iIktURFCrcvVNsQiJa/UtgQKBgCGZduyk7mtYatd9M3tG" +
            "HhMA+Q47KB0wbSPhn0YhZc+0VNZkjc5cS9IDn08cEA4HRRfob3Ou0+N9qla3MqXt" +
            "R9C3zb152OL4MmW9/u/0yoPu8NavhX+CbkJ56OeaPsd99a9pEJTRf0+YIkpKA0EZ" +
            "lKXOV21h9WXMBq+z/12CUyy0"
        );

        it("importKey/exportKey spki RSAES-PKCS1-v1_5 public key", function () {
            var error,
                key,
                exportedSpkiKeyData;

            runs(function () {
                error = undefined;
                cryptoSubtle.importKey("spki", spkiPubKeyData, { name: "RSAES-PKCS1-v1_5" }, true, [])
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return key || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.type).toBe("public");
                expect(key.extractable).toBe(true);
                // TODO: confirm that these checks are valid and add them
                // expect(key.algorithm.name).toBe("RSAES-PKCS1-v1_5");
                // expect(key.keyUsage).toEqual([]);
            });

            // verify exported key matches what was imported
            runs(function () {
                error = undefined;
                cryptoSubtle.exportKey("spki", key)
                .catch(function (result) {
                    error = "ERROR";
                })
                .then(function (result) {
                    exportedSpkiKeyData = result;
                })
            });

            waitsFor(function () {
                return error || exportedSpkiKeyData;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(exportedSpkiKeyData).toBeDefined();
                expect(base16.stringify(exportedSpkiKeyData)).toBe(base16.stringify(spkiPubKeyData));
            });
        });

        it("importKey/exportKey pkcs8 RSAES-PKCS1-v1_5 private key", function () {
            var error,
                privKey,
                pkcs8PrivKeyData2;

            // import pkcs8-formatted private key
            runs(function () {
                cryptoSubtle.importKey("pkcs8", pkcs8PrivKeyData, { name: "RSAES-PKCS1-v1_5" }, true, [])
                .then(function (result) {
                    privKey = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return privKey || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(privKey).toBeDefined();
                expect(privKey.type).toBe("private");
                expect(privKey.extractable).toBe(true);
                //expect(privKey.algorithm.name).toBe("RSAES-PKCS1-v1_5");
            });

            // export the private key back out, raw pkcs8 data should be the same
            runs(function () {
                error = undefined;
                cryptoSubtle.exportKey("pkcs8", privKey)
                .then(function (result) {
                    pkcs8PrivKeyData2 = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return pkcs8PrivKeyData2 || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(pkcs8PrivKeyData2).toBeDefined();
                expect(base16.stringify(pkcs8PrivKeyData2)).toBe(base16.stringify(pkcs8PrivKeyData));
            });
        });

        it("importKey RSAES-PKCS1-v1_5 pkcs8 private key + spki public key, encrypt/decrypt", function () {
            var error,
                privKey,
                pubKey;

            // import pkcs8-formatted private key
            runs(function () {
                cryptoSubtle.importKey("pkcs8", pkcs8PrivKeyData, { name: "RSAES-PKCS1-v1_5" }, false)
                .then(function (result) {
                    privKey = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return privKey || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(privKey).toBeDefined();
                expect(privKey.type).toBe("private");
                expect(privKey.extractable).toBe(false);
                //expect(privKey.algorithm.name).toBe("RSAES-PKCS1-v1_5");
            });

            // import corresponding spki-formatted public key
            runs(function () {
                error = undefined;
                cryptoSubtle.importKey("spki", spkiPubKeyData, { name: "RSAES-PKCS1-v1_5" }, false)
                .then(function (result) {
                    pubKey = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return pubKey || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(pubKey).toBeDefined();
                expect(pubKey.type).toBe("public");
                expect(pubKey.extractable).toBe(true);
                // TODO: confirm that these checks are valid and add them
                // expect(pubKey.algorithm.name).toBe("RSAES-PKCS1-v1_5");
            });

            var clearText = base16.parse("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
            var cipherText;

            // encrypt clearText with the public key
            runs(function () {
                error = undefined;
                cryptoSubtle.encrypt({ name: "RSAES-PKCS1-v1_5" }, pubKey, clearText)
                .then(function (result) {
                    cipherText = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return cipherText || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(cipherText).toBeDefined();
                expect(base16.stringify(cipherText)).not.toBe(base16.stringify(clearText));
            });

            var decrypted;

            // decrypt cipherText with the private key, should get the same clearText back
            runs(function () {
                error = undefined;
                cryptoSubtle.decrypt({ name: "RSAES-PKCS1-v1_5" }, privKey, cipherText)
                .then(function (result) {
                    decrypted = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return decrypted || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(decrypted).toBeDefined();
                expect(base16.stringify(decrypted)).toBe(base16.stringify(clearText));
            });
        });

    });

    // --------------------------------------------------------------------------------

    describe("RSA operations", function () {

        var pubKey_RSAES_PKCS1_v1_5,
            privKey_RSAES_PKCS1_v1_5,
            pubKey_RSASSA_PKCS1_v1_5,
            privKey_RSASSA_PKCS1_v1_5;

        var initialized;
        beforeEach(function () {
            if (initialized) return;
            initialized = true;
            var error;

            // generate the keys before each test

            // RSAES-PKCS1-v1_5
            runs(function () {
                error = undefined;
                cryptoSubtle.generateKey({ name: "RSAES-PKCS1-v1_5", modulusLength: 512, publicExponent: new Uint8Array([0x01, 0x00, 0x01]) }, false, [])
                .then(function (result) {
                    pubKey_RSAES_PKCS1_v1_5 = result.publicKey;
                    privKey_RSAES_PKCS1_v1_5 = result.privateKey;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });
            waitsFor(function () {
                return pubKey_RSAES_PKCS1_v1_5 || privKey_RSAES_PKCS1_v1_5 || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(pubKey_RSAES_PKCS1_v1_5).toBeDefined();
                expect(pubKey_RSAES_PKCS1_v1_5.extractable).toBeTruthy() // public key is forced extractable
                expect(privKey_RSAES_PKCS1_v1_5).toBeDefined();
                expect(privKey_RSAES_PKCS1_v1_5.extractable).toBeFalsy(); // private key takes the extractable input arg val
            });
            
            // RSASSA-PKCS1-v1_5
            runs(function () {
                error = undefined;
                cryptoSubtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 512, publicExponent: new Uint8Array([0x01, 0x00, 0x01]) }, false, [])
                .catch(function (result) {
                    error = "ERROR";
                })
                .then(function (result) {
                    pubKey_RSASSA_PKCS1_v1_5 = result.publicKey;
                    privKey_RSASSA_PKCS1_v1_5 = result.privateKey;
                })
            });
            waitsFor(function () {
                return pubKey_RSASSA_PKCS1_v1_5 || privKey_RSASSA_PKCS1_v1_5 || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(pubKey_RSASSA_PKCS1_v1_5).toBeDefined();
                expect(pubKey_RSASSA_PKCS1_v1_5.extractable).toBeTruthy() // public key is forced extractable
                expect(privKey_RSASSA_PKCS1_v1_5).toBeDefined();
                expect(privKey_RSASSA_PKCS1_v1_5.extractable).toBeFalsy(); // private key takes the extractable input arg val
            });

        });

        it("generateKey RSAES-PKCS1-v1_5", function () {
            // make sure proper keys are created via beforeEach
            runs(function () {
                expect(pubKey_RSAES_PKCS1_v1_5).toBeDefined();
                expect(pubKey_RSAES_PKCS1_v1_5.type).toBe("public");
                expect(privKey_RSAES_PKCS1_v1_5).toBeDefined();
                expect(privKey_RSAES_PKCS1_v1_5.type).toBe("private");
                // TODO: confirm that these checks are valid and add them
                // expect(pubKey.algorithm.name).toBe("RSASSA-PKCS1-v1_5");
                // expect(privKey.algorithm.name).toBe("RSASSA-PKCS1-v1_5");
                // TODO: more key tests?
            });
        });

        it("generateKey RSASSA-PKCS1-v1_5", function () {
            // make sure proper keys are created via beforeEach
            runs(function () {
                expect(pubKey_RSASSA_PKCS1_v1_5).toBeDefined();
                expect(pubKey_RSASSA_PKCS1_v1_5.type).toBe("public");
                expect(privKey_RSASSA_PKCS1_v1_5).toBeDefined();
                expect(privKey_RSASSA_PKCS1_v1_5.type).toBe("private");
                // TODO: confirm that these checks are valid and add them
                // expect(pubKey.algorithm.name).toBe("RSASSA-PKCS1-v1_5");
                // expect(privKey.algorithm.name).toBe("RSASSA-PKCS1-v1_5");
                // TODO: more key tests?
            });
        });

        it("encrypt/decrypt RSAES-PKCS1-v1_5", function () {
            var error,
                clearText = base16.parse("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");

            var encrypted;

            // encrypt clearText with the public key
            runs(function () {
                error = undefined;
                cryptoSubtle.encrypt({ name: "RSAES-PKCS1-v1_5" }, privKey_RSAES_PKCS1_v1_5, clearText)
                .then(function (result) {
                    encrypted = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return encrypted || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(encrypted).toBeDefined();
                expect(base16.stringify(encrypted)).not.toBe(base16.stringify(clearText));
            });

            var decrypted;

            // decrypt cipherText with the private key, should get the same clearText back
            runs(function () {
                error = undefined;
                cryptoSubtle.decrypt({ name: "RSAES-PKCS1-v1_5" }, privKey_RSAES_PKCS1_v1_5, encrypted)
                .then(function (result) {
                    decrypted = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return decrypted || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(decrypted).toBeDefined();
                expect(base16.stringify(decrypted)).toBe(base16.stringify(clearText));
            });
        });

        it("sign/verify RSASSA-PKCS1-v1_5 SHA-256", function () {
            var error;

            var data = base16.parse("000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f");
            // var data = base64.parse("eyJtZXNzYWdlaWQiOjIwNTQ5MzA2ODcsIm5vbnJlcGxheWFibGUiOmZhbHNlLCJyZW5ld2FibGUiOnRydWUsImNhcGFiaWxpdGllcyI6eyJjb21wcmVzc2lvbmFsZ29zIjpbIkxaVyJdfSwia2V5cmVxdWVzdGRhdGEiOlt7InNjaGVtZSI6IkFTWU1NRVRSSUNfV1JBUFBFRCIsImtleWRhdGEiOnsia2V5cGFpcmlkIjoicnNhS2V5cGFpcklkIiwibWVjaGFuaXNtIjoiUlNBIiwicHVibGlja2V5IjoiVFVsSFNrRnZSMEpCVDFsWFV6WTJObmxIY2s1NVNFZG5OMjB2WjJSbmIwSjFSRmh6SzNCTlNXVkxjVTVQZDJWSmFubHpUWEo0U1U5NFoyeE1TM0ZFTmtsbFdqZHdNVUppVUVWNFdGaEthM05aTkdkVFRrTTNNRU5sUVVKRVVUZEZiM0ZpV0dVd1JEbFVWRTVPTDBwTlVtNUpjbVZ1WlhVNU5XTnhObnBoTUhnMVYxZHphM1pMU0U4emNtRlZPWGRGY0M5WlJWTTNiVlZ6YTJseVdrNUJLMFpVVFZSYU9USmpVMWg2V1M5ck1GRTJaR1UzUVdkTlFrRkJSVDA9In19XX0=");

            var signature;

            // sign data with the private key
            runs(function () {
                error = undefined;
                cryptoSubtle.sign({ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, privKey_RSASSA_PKCS1_v1_5, data)
                .then(function (result) {
                    signature = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return signature || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                // TODO: more tests
                expect(signature).toBeDefined();
            });

            var verified;

            // verify data with the public key
            runs(function () {
                error = undefined;
                cryptoSubtle.verify({ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, pubKey_RSASSA_PKCS1_v1_5, signature, data)
                .then(function (result) {
                    verified = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return verified !== undefined || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(verified).toBe(true);
            });

            // verify data with the public key and bad signature
            runs(function () {
                error = undefined;
                verified = undefined;
                signature[10] = signature[10] ^ 0xFF;
                cryptoSubtle.verify({ name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, pubKey_RSASSA_PKCS1_v1_5, signature, data)
                .then(function (result) {
                    verified = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            });

            waitsFor(function () {
                return verified !== undefined || error;
            });

            runs(function () {
                expect(error).toBeUndefined();
                expect(verified).toBe(false);
            });

        });

    });

    // --------------------------------------------------------------------------------

    describe("JWK import / export", function () {

        it("import / export jwk", function () {
            var error;
            var key;
            var exportedData;
            var key128 = new Uint8Array([0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F]);
            var key256 = new Uint8Array(key128.length * 2);
            key256.set(key128);
            key256.set(key128, key128.length);
            
            // A128CBC import / export
            var jwk1 = latin1.parse(JSON.stringify({
                alg:    "A128CBC",
                kty:    "oct",
                use:    "enc",
                extractable:    true,
                k:      base64.stringifyUrlSafe(key128),
            }));
            runs(function () {
                key = undefined;
                error = undefined;
                cryptoSubtle.importKey("jwk", jwk1, { name: "RSAES-PKCS1-v1_5" }, true)
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return key || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.algorithm.name).toBe("AES-CBC");
            });
            runs(function () {
                error = undefined;
                exportedData = undefined;
                cryptoSubtle.exportKey("jwk", key)
                .then(function (result) {
                    exportedData = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return exportedData || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(JSON.parse(latin1.stringify(exportedData))).toEqual(JSON.parse(latin1.stringify(jwk1)));
            });

            // A256GCM import / export
            var jwk2 = latin1.parse(JSON.stringify({
                alg:    "A256GCM",
                kty:    "oct",
                use:    "enc",
                extractable:    true,
                k:      base64.stringifyUrlSafe(key256),
            }));
            runs(function () {
                key = undefined;
                error = undefined;
                cryptoSubtle.importKey("jwk", jwk2, { name: "RSAES-PKCS1-v1_5" }, true)
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return key || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.algorithm.name).toBe("AES-GCM");
            });
            runs(function () {
                error = undefined;
                exportedData = undefined;
                cryptoSubtle.exportKey("jwk", key)
                .then(function (result) {
                    exportedData = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return exportedData || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(JSON.parse(latin1.stringify(exportedData))).toEqual(JSON.parse(latin1.stringify(jwk2)));
            });

            // HS256 import / export
            var jwk3 = latin1.parse(JSON.stringify({
                alg:    "HS256",
                kty:    "oct",
                use:    "sig",
                extractable:    true,
                k:      base64.stringifyUrlSafe(key256),
            }));
            runs(function () {
                key = undefined;
                error = undefined;
                cryptoSubtle.importKey("jwk", jwk3, { name: "RSAES-PKCS1-v1_5" }, true)
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return key || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.algorithm.name).toBe("HMAC");
                expect(key.algorithm.params.hash.name).toBe("SHA-256");
            });
            runs(function () {
                error = undefined;
                exportedData = undefined;
                cryptoSubtle.exportKey("jwk", key)
                .then(function (result) {
                    exportedData = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return exportedData || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(JSON.parse(latin1.stringify(exportedData))).toEqual(JSON.parse(latin1.stringify(jwk3)));
            });

            // RSA1_5 import / export
            var jwk4 = latin1.parse(JSON.stringify({
                alg:    "RSA1_5",
                kty:    "RSA",
                n:      base64.stringifyUrlSafe(base16.parse(
                            "a8b3b284af8eb50b387034a860f146c4919f318763cd6c55" +
                            "98c8ae4811a1e0abc4c7e0b082d693a5e7fced675cf46685" +
                            "12772c0cbc64a742c6c630f533c8cc72f62ae833c40bf258" +
                            "42e984bb78bdbf97c0107d55bdb662f5c4e0fab9845cb514" +
                            "8ef7392dd3aaff93ae1e6b667bb3d4247616d4f5ba10d4cf" +
                            "d226de88d39f16fb"
                )),
                e:      base64.stringifyUrlSafe(base16.parse("010001")),
                extractable: true,
            }));
            runs(function () {
                key = undefined;
                error = undefined;
                cryptoSubtle.importKey("jwk", jwk4, { name: "AES-CBC" })
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return key || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.algorithm.name).toBe("RSAES-PKCS1-v1_5");
            });
            runs(function () {
                error = undefined;
                exportedData = undefined;
                cryptoSubtle.exportKey("jwk", key)
                .then(function (result) {
                    exportedData = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return exportedData || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(JSON.parse(latin1.stringify(exportedData))).toEqual(JSON.parse(latin1.stringify(jwk4)));
            });

            // A128KW import / export
            var jwk5 = latin1.parse(JSON.stringify({
                alg:    "A128KW",
                kty:    "oct",
                use:    "wrap",
                extractable:    true,
                k:      base64.stringifyUrlSafe(key128),
            }));
            runs(function () {
                key = undefined;
                error = undefined;
                cryptoSubtle.importKey("jwk", jwk5, { name: "RSAES-PKCS1-v1_5" }, true)
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return key || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.algorithm.name).toBe("AES-KW");
            });
            runs(function () {
                error = undefined;
                exportedData = undefined;
                cryptoSubtle.exportKey("jwk", key)
                .then(function (result) {
                    exportedData = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return exportedData || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(JSON.parse(latin1.stringify(exportedData))).toEqual(JSON.parse(latin1.stringify(jwk5)));
            });

            // A256KW import / export
            var jwk6 = latin1.parse(JSON.stringify({
                alg:    "A256KW",
                kty:    "oct",
                use:    "wrap",
                extractable:    true,
                k:      base64.stringifyUrlSafe(key256),
            }));
            runs(function () {
                key = undefined;
                error = undefined;
                cryptoSubtle.importKey("jwk", jwk6, { name: "RSAES-PKCS1-v1_5" }, true)
                .then(function (result) {
                    key = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return key || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(key.algorithm.name).toBe("AES-KW");
            });
            runs(function () {
                error = undefined;
                exportedData = undefined;
                cryptoSubtle.exportKey("jwk", key)
                .then(function (result) {
                    exportedData = result;
                })
                .catch(function (result) {
                    error = "ERROR";
                })
            })
            waitsFor(function () {
                return exportedData || error;
            });
            runs(function () {
                expect(error).toBeUndefined();
                expect(key).toBeDefined();
                expect(JSON.parse(latin1.stringify(exportedData))).toEqual(JSON.parse(latin1.stringify(jwk6)));
            });

        });
    });

})();